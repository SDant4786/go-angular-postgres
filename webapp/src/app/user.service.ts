import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "./user";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  baseUrl: string = '/users';
  readonly headers = new HttpHeaders()
    .set('Content-Type', 'application/json');

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  add(u: User): Observable<User> {
    return this.http.post<User>(this.baseUrl, u, {headers: this.headers});
  }

  update(u: User): Observable<User> {
    return this.http.put<User>(
      `${this.baseUrl}/${u.id}`, u, {headers: this.headers}
    );
  }

  delete(id: string): Observable<User> {
    return this.http.delete<User>(`${this.baseUrl}/${id}`);
  }
}
