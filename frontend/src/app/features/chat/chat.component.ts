import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService, Conversation, Message } from '../../core/chat.service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  conversations: Conversation[] = [];
  messages: Message[] = [];
  currentConversationId: number | null = null;
  newMessage: string = '';
  loading: boolean = false;
  isSidebarOpen: boolean = true;
  loginVisible: boolean = false;
  signupVisible: boolean = false;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.loadConversations();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  showLogin() {
    this.loginVisible = true;
    this.signupVisible = false;
  }

  showSignup() {
    this.signupVisible = true;
    this.loginVisible = false;
  }


  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  loadConversations() {
    this.chatService.getConversations().subscribe(convs => {
      this.conversations = convs;
      if (this.conversations.length > 0 && !this.currentConversationId) {
        this.selectConversation(this.conversations[0]);
      }
    });
  }

  selectConversation(conv: Conversation) {
    this.currentConversationId = conv.id;
    this.chatService.getConversation(conv.id).subscribe(details => {
      this.messages = details.messages || [];
      this.scrollToBottom();
    });
  }

  startNewChat() {
    this.chatService.createConversation("New Chat").subscribe(conv => {
      this.conversations.unshift(conv);
      this.currentConversationId = conv.id;
      this.messages = [];
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const content = this.newMessage;
    this.newMessage = '';

    if (!this.currentConversationId) {
      this.loading = true;
      this.chatService.createConversation('New Chat').subscribe({
        next: (conv) => {
          this.conversations.unshift(conv);
          this.currentConversationId = conv.id;
          this.processSendMessage(this.currentConversationId, content);
        },
        error: () => this.loading = false
      });
    } else {
      this.processSendMessage(this.currentConversationId, content);
    }
  }

  private processSendMessage(conversationId: number, content: string) {
    // Optimistic UI
    this.messages.push({ role: 'user', content });
    this.loading = true;

    this.chatService.sendMessage(conversationId, content).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.loading = false;
        this.scrollToBottom();
      },
      error: () => {
        this.loading = false;
        // Handle error (maybe remove optimistic message or show error)
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.chatService.uploadDocument(file).subscribe({
        next: () => alert('Document uploaded successfully for RAG!'),
        error: () => alert('Upload failed.')
      });
    }
  }


}
