from dotenv import load_dotenv
load_dotenv()

import sys
import os
import traceback

import cloudinary
import cloudinary.uploader
import cloudinary.api

from models import ShelfImage

cloudinary.config(
  cloud_name="dogwmabtw",
  api_key="599245761912895",
  api_secret="yPWF726lHt6OxuIqRmfSNiGef7E"
)

def upload(filepath):
    public_id = filepath.split('/')[-1]
    # Do not include file extension
    if '.' in public_id:
        public_id = public_id.split('.')[0]
    print(public_id)

    # Ref: https://cloudinary.com/documentation/image_upload_api_reference#upload_method
    return cloudinary.uploader.upload(
        filepath,
        public_id=public_id,
        folder="shelf_images/",  # folder on cloudinary
        unique_filename=False,  # don't append unique characters at the end
        overwrite=True,  # overwrite if already exists
        resource_type="image")

def upsert_to_db(uploaded):
    images = [
        ShelfImage(
            cloudinary_public_id=img['public_id'],
            cloudinary_url=img['url'])
        for img in uploaded
    ]
    
    try:
        ShelfImage.objects.bulk_create(images)
        print('all images saved to db')
    except:
        traceback.print_exc()
        try:
            for img in images:
                img.save()
                print(f'{img.cloudinary_public_id} saved to db')
        except:
            pass

if __name__ == '__main__':
    folder_path = sys.argv[1]

    uploaded = []
    
    for filename in os.listdir(folder_path):
        filepath = (
            folder_path
            + ('/' if not folder_path.endswith('/') else '')
            + filename)
        res = upload(filepath)
        print(res['public_id'])
        uploaded.append(res)

    upsert_to_db(uploaded)
    print('done')
