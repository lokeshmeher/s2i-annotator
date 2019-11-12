from dotenv import load_dotenv
load_dotenv()

import sys
import traceback
import sqlite3

import cloudinary
import cloudinary.uploader
import cloudinary.api

from models import ProductImage, ImageBbox, ImageCrop


cloudinary.config(
  cloud_name="dogwmabtw",
  api_key="599245761912895",
  api_secret="yPWF726lHt6OxuIqRmfSNiGef7E"
)


def _get_id(img):
    return (f"{img['shelfImage']['id']}"
            f"--{img['bbox']['x']}-{img['bbox']['y']}-{img['bbox']['w']}-{img['bbox']['h']}"
            f"--{img['crop']['x']}-{img['crop']['y']}-{img['crop']['w']}-{img['crop']['h']}")


shelf_images = {}
def _get_shelf_image_url(img):
    global shelf_images
    id_ = img['shelfImage']['id']
    
    if id_ not in shelf_images:
        res = cloudinary.api.resources_by_ids([id_])
        shelf_images[id_] = res['resources'][0]
    
    return shelf_images[id_]['url']


def upsert_to_db(images):
    try:
        ProductImage.objects.bulk_create(images)
        print('all images saved to db')
    except:
        traceback.print_exc()
        try:
            for img in images:
                img.save()
                print(f'{img.id} saved to db')
        except:
            pass


if __name__ == '__main__':
    db_path = sys.argv[1]
    try:
        connection =  sqlite3.connect(db_path)
    except:
        raise RuntimeError('Invalid db path. Please provide path to the sqlite3 db')
    cursor = connection.cursor()
    
    crops = cursor.execute('SELECT filename, upc, is_done FROM progress WHERE type=?', ('crop',)).fetchall()

    to_insert = []
    for (item, upc, reviewed) in crops:
        item = item.replace('.jpg', '')
        filename, bbox = item.split('--')
        x, y, x2, y2 = map(int, bbox.split('-'))
        w, h = x2-x, y2-y
        midx, midy = x + w//2, y + h//2
        
        img = {
            'shelfImage': {
                # 'shelf_images/' is the name of the remote folder on Cloudinary
                'id': 'shelf_images/' + filename
            },
            'bbox': {'x': x, 'y': y, 'w': w, 'h': h},
            'crop': {
                'x': max(0, int(midx - 2*w//2)),
                'y': max(0, int(midy - 2*h//2)),
                'w': 2*w,
                'h': 2*h
            }
        }
        
        to_insert.append(ProductImage(
            id=_get_id(img),
            shelf_image_id=f'{img["shelfImage"]["id"]}',
            shelf_image_url=_get_shelf_image_url(img),
            upc=upc,
            crop=ImageCrop(
                x=img['crop']['x'],
                y=img['crop']['y'],
                w=img['crop']['w'],
                h=img['crop']['h']),
            bbox=ImageBbox(
                x=img['bbox']['x'],
                y=img['bbox']['y'],
                w=img['bbox']['w'],
                h=img['bbox']['h']),
            review_status='reviewed' if reviewed else 'to-review')
        )
    
    upsert_to_db(to_insert)
