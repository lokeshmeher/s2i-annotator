from dotenv import load_dotenv
load_dotenv()

import traceback
import sys
import csv
from pymodm.connection import _get_db
from pymongo.errors import BulkWriteError
from models import SKU

def chunks(l, n):
    """Yield successive n-sized chunks from l"""
    for i in range(0, len(l), n):
        yield l[i:i + n]

def insert_docs(skus, chunk_size):
    for chunk in chunks(skus, chunk_size):
        try:
            SKU.objects.bulk_create(chunk)
        except BulkWriteError as err:
            print('\n', err.details)
            # In case of error in the chunk, insert one by one
            for doc in chunk:
                try:
                    doc.save()
                except:
                    pass


if __name__ == '__main__':
    csv_file = sys.argv[1]
    try:
        chunk_size = int(sys.argv[2])
    except IndexError:
        chunk_size = 50
    
    with open(csv_file) as csvfile:
        has_header = csv.Sniffer().has_header(csvfile.read(1024))
        csvfile.seek(0)
        reader = csv.reader(csvfile)
        if has_header:
            next(reader)
        
        uniq_skus = dict()
        for (upc, brand, brand_variant, promotion, product_count, pack_count, shape, size, price, comment, view) in reader:
            if upc not in uniq_skus:
                uniq_skus[upc] = SKU(
                    upc=upc,
                    brand=brand or '',
                    brand_variant=brand_variant or '',
                    promotion=promotion or '',
                    product_count=product_count or '',
                    pack_count=pack_count or '',
                    shape=shape or '',
                    size=size or '',
                    price=price or '',
                    comment=comment or '',
                    view=view or '',
                )
        
        print('unique:', len(uniq_skus))
        insert_docs(list(uniq_skus.values()), chunk_size)
