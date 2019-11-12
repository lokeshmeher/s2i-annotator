import os
from pymodm import (
    connect, fields, MongoModel, EmbeddedMongoModel
)
import pymongo
from pymongo.operations import IndexModel

MONGO_PASSWORD = os.environ.get('MONGO_PASSWORD')
if MONGO_PASSWORD:
    MONGO_URL = f'mongodb+srv://primary:{MONGO_PASSWORD}@production-sp8hx.mongodb.net/s2i?retryWrites=true&w=majority'
else:
    MONGO_URL = 'mongodb://localhost:27017/s2i'

connect(MONGO_URL)

class ShelfImage(MongoModel):
    # Drawback: Ties primary key to cloudinary but migration is easy.
    cloudinary_public_id = fields.CharField(primary_key=True)
    cloudinary_url = fields.URLField()
    review_status = fields.CharField(
        choices=['reviewed', 'to-review'],
        default='to-review')

    class Meta:
        collection_name = 'shelf_images'

    def to_json(self):
        return {
            "id": self.cloudinary_public_id,
            "url": self.cloudinary_url,
            "reviewStatus": self.review_status
        }

class ImageCrop(EmbeddedMongoModel):
    x = fields.IntegerField()
    y = fields.IntegerField()
    w = fields.IntegerField()
    h = fields.IntegerField()

class ImageBbox(EmbeddedMongoModel):
    x = fields.IntegerField()
    y = fields.IntegerField()
    w = fields.IntegerField()
    h = fields.IntegerField()

class ProductImage(MongoModel):
    id = fields.CharField(primary_key=True)
    shelf_image_id = fields.CharField(required=True)
    shelf_image_url = fields.URLField(required=True)
    upc = fields.CharField(default='000000000000')
    crop = fields.EmbeddedDocumentField(ImageCrop)
    bbox = fields.EmbeddedDocumentField(ImageBbox)
    review_status = fields.CharField(choices=('reviewed', 'to-review'))

    class Meta:
        collection_name = 'product_images'
        indexes = [
            IndexModel([
                ('upc', pymongo.ASCENDING)
            ]),
            IndexModel([
                ('shelf_image_id', pymongo.ASCENDING)
            ])
        ]
    
    def to_json(self):
        return {
            "id": self.id,
            "shelfImage": {
                "id": self.shelf_image_id,
                "url": self.shelf_image_url
            },
            "crop": {
                "x": self.crop.x if self.crop else None,
                "y": self.crop.y if self.crop else None,
                "w": self.crop.w if self.crop else None,
                "h": self.crop.h if self.crop else None
            },
            "bbox": {
                "x": self.bbox.x if self.bbox else None,
                "y": self.bbox.y if self.bbox else None,
                "w": self.bbox.w if self.bbox else None,
                "h": self.bbox.h if self.bbox else None
            },
            "upc": self.upc,
            "reviewStatus": self.review_status
        }

class SKU(MongoModel):
    upc = fields.CharField()
    brand = fields.CharField()
    brand_variant = fields.CharField()
    promotion = fields.CharField()
    product_count = fields.CharField()
    pack_count = fields.CharField()
    shape = fields.CharField()
    size = fields.CharField()
    price = fields.CharField()
    comment = fields.CharField()
    view = fields.CharField()

    class Meta:
        collection_name = 'skus'
        indexes = [
            IndexModel([
                ('upc', pymongo.ASCENDING)
            ])
        ]

    def to_json(self):
        return {
            "upc": self.upc,
            "brand": self.brand,
            "brand_variant": self.brand_variant,
            "promotion": self.promotion,
            "product_count": self.product_count,
            "pack_count": self.pack_count,
            "shape": self.shape,
            "size": self.size,
            "price": self.price,
            "comment": self.comment,
            "view": self.view
        }
