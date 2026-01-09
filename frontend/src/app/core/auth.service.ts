import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = '/api/v1';
    private userSubject = new BehaviorSubject<any>(null);
    public user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadUser();
    }

    private loadUser() {
        const token = localStorage.getItem('token');
        if (token) {
            this.userSubject.next({ token });
        }
    }

    /** LOGIN */
    login(credentials: { email: string; password: string }): Observable<any> {
        return this.http
            .post<any>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(res => {
                    localStorage.setItem('token', res.access_token);
                    this.userSubject.next({ token: res.access_token });
                })
            );
    }

    /** SIGNUP */
    signup(user: { email: string; password: string }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/signup`, user).pipe(
            tap(res => {
                if (res.access_token) {
                    localStorage.setItem('token', res.access_token);
                    this.userSubject.next({ token: res.access_token });
                }
            })
        );
    }

    /** LOGOUT */
    logout() {
        localStorage.removeItem('token');
        this.userSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
