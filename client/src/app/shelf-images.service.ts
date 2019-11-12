import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HOST } from '../constants'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShelfImagesService {
  items = []

  constructor(
    private http: HttpClient
  ) { }

  getItems(skip: number = 0, limit: number = 0): Observable<any> {
    return this.http.get(`${API_HOST}/shelfImages`, {
      params: { skip: skip.toString(), limit: limit.toString() }
    })
  }

  getProductImagesCount(shelfImageId): Observable<any> {
    return this.http.get(`${API_HOST}/shelfImages/${shelfImageId}:counts`)
  }

  getTotalCount(): Observable<any> {
    return this.http.get(`${API_HOST}/shelfImages:count`)
  }

  bulkUpdate(arr): Observable<any> {
    return this.http.patch(`${API_HOST}/shelfImages`, arr)
  }

  getBboxes(shelfImageId: string, skip: number, limit: number): Observable<any> {
    return this.http.get(`${API_HOST}/productImages`, {
      params: { shelfImageId, skip: skip.toString(), limit: limit.toString(), fields: 'bbox' }
    })
  }

}
