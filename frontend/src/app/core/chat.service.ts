import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Message {
    role: string;
    content: string;
}

export interface Conversation {
    id: number;
    title: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = '/api/v1/chat';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders() {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getConversations(): Observable<Conversation[]> {
        return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`, { headers: this.getHeaders() });
    }

    createConversation(title: string): Observable<Conversation> {
        return this.http.post<Conversation>(`${this.apiUrl}/conversations`, { title }, { headers: this.getHeaders() });
    }

    getConversation(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/conversations/${id}`, { headers: this.getHeaders() });
    }

    sendMessage(conversationId: number, content: string): Observable<Message> {
        return this.http.post<Message>(
            `${this.apiUrl}/conversations/${conversationId}/messages`,
            { role: 'user', content },
            { headers: this.getHeaders() }
        );
    }

    uploadDocument(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<any>('/api/v1/rag/upload', formData, { headers: this.getHeaders() });
    }
}
