"""
Entities:
  - shelf image
    - id
    - review status

  - bbox image (cropped product image with bbox)
    - id
    - origin image
    - crop boundaries
    - bbox boundaries
    - review status
    - upc

  - upc
    - id
    - name
    - ... (attributes describing the SKU)

Actions:
  - Get a list of shelf images (filter: to-review/reviewed)
  - Update a shelf image with bboxes
    - Delete a set of bboxes
    - Insert a set of bboxes
  - Update a shelf image to to-review / reviewed
  - Update a list of shelf images to to-review / reviewed
  - Delete all bboxes in a shelf image
  - Update review status of a shelf image
  
  - Get a list of bboxes (filter: upc)
  - Update upc for a bbox
  - Update review status of a bbox

  - Update default SKU suggestions

Routes (including params):
  NOTE: "NA" is not implemented

  - GET /shelfImages?reviewStatus=(reviewed|to-review)
  - POST /shelfImages  -- NA [can be used for bulk uploading/insert of shelf images]
  - PATCH /shelfImages  [Partially update a set of ShelfImages]
    [
      {
        "id": 1,
        "reviewStatus": "reviewed"
      },
      {
        "id": 2,
        "reviewStatus": "reviewed"
      },
      ...
    ]
  - GET /shelfImages/<imageId>  -- NA
  - PUT /shelfImages/<imageId>  -- NA
    {
      "reviewStatus": "to-review"
    }
  - POST /shelfImages/<imageId>:bulkDeleteProductImages
  
  - GET /productImages?shelfImageId=<imageId>&upc=<upcId>&reviewStatus=(reviewed|to-review)&skip=0&limit=30  [contains list of images with counts for to-review, reviewed and total]
  - GET /productImages?upc=<upc>  [retrieve metadata for product counts]
  - POST /productImages  -- NA
    { ... }  // ProductImage
  - POST /productImages:bulkInsert  [following Google's API design practice of custom verbs]
    [
      { ... },  // ProductImage
      { ... },
      ...
    ]
  - POST /productImages:bulkDelete  [following Google's API design practice of custom verbs]
    [
      { ... },  // ProductImage - only Id is needed
      ...
    ]
  - PATCH /productImages  [can also be done by POST /productImages:bulkUpdate]
    [
      { "id": 1, "upc": "...", "reviewStatus": "reviewed" },
      { "id": 2, "upc": "...", "reviewStatus": "reviewed" },
      ...
    ]
  - PUT /productImages/<imageId>  -- NA
    {
      "upc": "...",
      "reviewStatus": "reviewed"
    }
  
  - PUT /upcSuggestions  [update list of default UPCs]

  - GET /skus?skip=0&limit=100&fields=upc,brand
  - GET /skus:search?q=<search query>  [Powered by ElasticSearch]

Entity representations:
  - ShelfImage
    - id
    - imageUrl
    - reviewStatus
    - skuSuggestions[]
  
  - ProductImage
    - id (<ShelfImage id>-<x>-<y>-<w>-<h>)
    - shelfImage
      - id
      - url
    - crop
      - x
      - y
      - w
      - h
    - bbox
      - x
      - y
      - w
      - h
    - upc
    - reviewStatus
  
  - SKU
    - upc (id)
    - brand
    - brand_variant
    - promotion
    - product_count
    - pack_count
    - shape
    - size
    - price
    - comment
    - view
"""

from dotenv import load_dotenv
load_dotenv()

from flask import (
    Flask, request, g, make_response, jsonify, abort)
from models import (
    ShelfImage, ProductImage, SKU, ImageCrop, ImageBbox)
from pymongo import UpdateOne
from pymodm.connection import _get_db
from flask_cors import CORS


"""
TODO:
  - Validation of incoming request data in all handlers.
  - Error handling on validation errors.
  - Error handling on writing to database.
"""

app = Flask(__name__)
CORS(app)

@app.errorhandler(404)
def not_found(error):
    print('not found:', request.path)
    return make_response(jsonify({'error': 'Not found'}), 404)


@app.route('/shelfImages', methods=['GET'])
def list_shelf_images():
    """Retrieve a paginated list of shelf images with optional filters."""
    review_status = request.args.get('reviewStatus')
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 10))
    
    query = {}
    if review_status:
        query['review_status'] = review_status
    
    items = [
      si.to_json()
      for si in ShelfImage.objects.raw(query).skip(skip).limit(limit)
    ]
    count = ShelfImage.objects.count()
    
    return jsonify({
      'data': items,
      'totalCount': count
    })

@app.route('/shelfImages/<path:image_id>:counts', methods=['GET'])
def get_shelf_images_counts(image_id):
    """Retrieve the counts of product images for a set of shelf images."""
    if image_id:
        total = ProductImage.objects.raw({'shelf_image_id': image_id}).count()
        return jsonify(total)

@app.route('/shelfImages:count', methods=['GET'])
def count_shelf_images():
    """Retrieve the counts of product images for a set of shelf images."""
    total = ShelfImage.objects.count()
    return jsonify(total)

@app.route('/shelfImages', methods=['PATCH'])
def update_shelf_images():
    """Update a set of shelf images."""
    images = request.get_json()
    if not images:
        abort(400)
    
    ops = []
    for img in images:
        ops.append(UpdateOne(
            {'_id': img['id']},
            {'$set': {'review_status': img['reviewStatus']}}  # BUG/TODO: might throw KeyError
        ))
    
    db = _get_db()
    coll = db[ShelfImage.Meta.collection_name]
    coll.bulk_write(ops, ordered=False)
    
    return jsonify([
        img.to_json()
        for img in ShelfImage.objects.raw({
            '_id': {'$in': [_['id'] for _ in images]}
        })
    ])

# image_id may contain '/', so using `path` converter
@app.route('/shelfImages/<path:image_id>:bulkDeleteProductImages', methods=['POST'])
def bulk_delete_shelf_product_images(image_id):
    """Bulk delete all product images related to a single shelf image."""
    if image_id:
        deleted = ProductImage.objects.raw({'shelf_image_id': image_id}).delete()
        return 'Deleted {} product images'.format(deleted)
    
    abort(404)

@app.route('/productImages', methods=['GET'])
def list_product_images():
    """Retrieve a paginated list of product images with optional filters."""
    shelf_image_id = request.args.get('shelfImageId')
    print(shelf_image_id)
    upc = request.args.get('upc')
    review_status = request.args.get('reviewStatus')
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 10))
    fields = request.args.get('fields')

    query = {}
    if shelf_image_id:
        query['shelf_image_id'] = shelf_image_id
    if upc:
        query['upc'] = upc
    if review_status:
        query['review_status'] = review_status
    
    print(query)
    qs = ProductImage.objects.raw(query).skip(skip).limit(limit)
    if fields:
        fields = fields.split(',')
        qs = qs.only(*fields)
    
    res = [img.to_json() for img in qs]
    if fields:
        res = [
            {key: item.get(key) for key in fields}
            for item in res
        ]
    
    print(len(res))
    return jsonify(res)

@app.route('/productImages:counts', methods=['GET'])
def get_product_image_counts():
    """Retrieve the count of product images for an applied filter condition."""
    upc = request.args.get('upc')
    if not upc:
        return make_response(jsonify({'error': 'Param `upc` is required'}), 400)
    
    total = ProductImage.objects.raw({'upc': upc}).count()
    to_review = ProductImage.objects.raw({'review_status': 'to-review'}).count()
    reviewed = ProductImage.objects.raw({'review_status': 'reviewed'}).count()
    
    return jsonify({
        'totalCount': total,
        'toReviewCount': to_review,
        'reviewedCount': reviewed
    })

@app.route('/productImages:bulkInsert', methods=['POST'])
def bulk_insert_product_images():
    """Create product images (crops) from a shelf image."""
    images = request.get_json()
    if not images:
        abort(400)
    
    to_save = []
    for img in images:
        # By default, set loose crop (product image) to
        # twice the size (w & h) of the bbox
        if not img.get('crop'):
            midx = img['bbox']['x'] + img['bbox']['w']//2
            midy = img['bbox']['y'] + img['bbox']['h']//2
            
            img['crop'] = {
                'x': max(0, int(midx - 2*img['bbox']['w']//2)),
                'y': max(0, int(midy - 2*img['bbox']['h']//2)),
                'w': 2*img['bbox']['w'],
                'h': 2*img['bbox']['h']
            }
        
        pi = ProductImage(
            id=(f"{img['shelfImage']['id']}"
                f"--{img['bbox']['x']}-{img['bbox']['y']}-{img['bbox']['w']}-{img['bbox']['h']}"
                f"--{img['crop']['x']}-{img['crop']['y']}-{img['crop']['w']}-{img['crop']['h']}"),
            shelf_image_id = img['shelfImage']['id'],
            shelf_image_url = img['shelfImage']['url'],
            review_status='to-review')
        
        if img.get('upc'):
            pi.upc = img['upc']
        
        pi.crop = ImageCrop(
            x=int(img['crop']['x']),
            y=int(img['crop']['y']),
            w=int(img['crop']['w']),
            h=int(img['crop']['h']))
        pi.bbox = ImageBbox(
            x=int(img['bbox']['x']),
            y=int(img['bbox']['y']),
            w=int(img['bbox']['w']),
            h=int(img['bbox']['h']))
        
        to_save.append(pi)

    # `full_clean=True` does validation of each MongoModel instance
    saved = ProductImage.objects.bulk_create(to_save, retrieve=True, full_clean=True)
    
    return jsonify([_.to_json() for _ in saved])

@app.route('/productImages:bulkDelete', methods=['POST'])
def bulk_delete_product_images():
    """Bulk delete a set of product images identified by their id."""
    images = request.get_json()
    if not images:
        abort(400)

    num_deleted = ProductImage.objects.raw({
        '_id': {'$in': [img['id'] for img in images]}
        }).delete()
    
    return 'Deleted {} product images'.format(num_deleted)

@app.route('/productImages', methods=['PATCH'])
def bulk_update_product_images():
    """Update a set of product images."""
    images = request.get_json()
    if not images:
        abort(400)
    
    # NOTE: Only considering id, upc and reviewStatus
    ops = []
    for img in images:
        if 'id' not in img:
            abort(400, '`id` is required for all product images')
        
        update = {'$set': {}}
        if img.get('upc'):
            update['$set']['upc'] = img['upc']
        if img.get('reviewStatus'):
            valid = ProductImage.review_status.choices
            
            if img['reviewStatus'] not in valid:
                abort(400, '`reviewStatus` must be one of {}'.format(valid))
            
            update['$set']['review_status'] = img['reviewStatus']
        else:
            continue
        
        ops.append(UpdateOne({'_id': img['id']}, update))
    
    if not ops:
        return jsonify([])
    
    db = _get_db()
    coll = db[ProductImage.Meta.collection_name]
    coll.bulk_write(ops, ordered=False)
    
    return jsonify([
        img.to_json()
        for img in ProductImage.objects.raw({
            '_id': {'$in': [_['id'] for _ in images]}
        })
    ])

# @app.route('/upcSuggestions', methods=['PUT'])
# def update_default_upc_suggestions():
#     pass

@app.route('/skus', methods=['GET'])
def list_skus():
    """Retrieve a paginated list of skus."""
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 10))
    fields = request.args.get('fields')
    
    # QuerySet
    qs = SKU.objects.skip(skip).limit(limit)
    if fields:
        fields = fields.split(',')
        qs = qs.only(*fields)
    
    res = [sku.to_json() for sku in qs]
    if fields:
        res = [
            {key: item.get(key) for key in fields}
            for item in res
        ]
    
    return jsonify(res)


if __name__ == '__main__':
    app.run(debug=True, port=5001)