# s2i-annotator

## Dependencies
- Web client
  - [npm](https://www.npmjs.com/get-npm), [Node.js](https://nodejs.org/en/) (>=10.9.0)
  - [angular CLI](https://angular.io/guide/setup-local#step-1-install-the-angular-cli): `npm install -g @angular/cli`
- Server
  - [Python 3](https://www.python.org/downloads/)
  - [pip](https://pip.pypa.io/en/stable/installing/)
  - [virtualenv](https://virtualenv.pypa.io/en/latest/installation/)


## Setup
- Create a virtualenv for server: `virtualenv --relocatable -p python3.7 venv`
- Install server dependencies: `pip install -r requirements.txt`
- Install frontend dependencies: `cd client && npm i`
- Create a *.env* file inside [server](./server/) - copy from *.env.example*. (Please check mail for secrets/passwords).


## Available commands
### Scripts
#### [server/insert_skus.py](./server/insert_skus.py)
`python insert_skus.py <path_to_csv_file> [chunk_size]`

- This script is used to insert existing SKUs (from a csv file) into database.
- *[server/dictionary.csv](./server/dictionary.csv)* contains example format.
- If the csv file is big, you can provide optional parameter `chunk_size` (e.g. `100`) that is the number of rows inserted in batches to the database.

#### [server/upload_shelf_images.py](./server/upload_shelf_images.py)
`python upload_shelf_images.py <path_to_directory_containing_shelf_images>`

- This script is used to upload shelf images (present in a folder) to cloudinary.

#### [server/create_product_images.py](./server/create_product_images.py)
`python create_product_images.py <path_to_sqlite3_database_file>`

- This script is used to insert config for existing crops (product images) from a already existing
sqlite3 database file.
- *[server/progress.db]*
- You could use [sqlitebrowser](https://sqlitebrowser.org) to view / update data.
- In real world, cronjobs/background processes that contain ML logic to generate crops / bboxes would insert the crops using the HTTP API route `POST /productImages` (not implemented).

### Server
`cd server && python app.py`

### Client
`cd client && ng serve`

### Postman collection
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/ff7875eef938e9b180f0)  
You can set the API host url in variables (default is `http://localhost:5001`).


## Explanation of architecture (ideal scenario)
- Uploading of shelf images in bulk can be done either using scripts or using the API routes.
- Cloudinary provides [a hook to provide a callback URL](https://cloudinary.com/blog/webhooks_upload_notifications_and_background_image_processing) that starts the pipeline to generate the crops once the upload of shelf image is complete. Similar functionality can be found in other providers / can be implemented in-house server.
- The generation of crops can be done in bulk using task queues / cronjobs for massive scalability.
- The crops are inserted in bulk using the API (e.g. `POST /productImages`). See [server/app.py](./server/app.py)


## Links to deployments
- [API server]()
- [Webapp]()


## Possible optimizations
- HTTP Caching - using something similar to [Redux](https://redux.js.org) to handle state management and offline use cases in client/SPA.


## Drawbacks
- SPA is not optimized for mobile layout / smaller screens.


## Explanations
- [Cloudinary](https://cloudinary.com/documentation/angular_integration#overview) is used for easy manipulation of images both in the frontend and backend.
- Only shelf images are uploaded. Crops are [**dynamically generated**](https://cloudinary.com/documentation/angular_image_manipulation#resizing_and_cropping) from it.
