import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
@Component({
    selector: 'app-login-popup',
    templateUrl: './login-popup.component.html',
    styleUrls: ['./login-popup.component.scss']
})
export class LoginPopupComponent {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() switchToSignup = new EventEmitter<void>();

    loginForm: FormGroup;
    errorMsg = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onLogin() {
        if (this.loginForm.invalid) return;

        this.authService.login(this.loginForm.value).subscribe({
            next: () => {
                this.onClose(); // Close popup first
                this.router.navigate(['/chat']);
            },
            error: (err) => {
                this.errorMsg = err.error?.message;
            }
        });
    }

    onClose() {
        this.visible = false;
        this.visibleChange.emit(this.visible);
        this.errorMsg = '';
    }

    onSwitchToSignup() {
        this.onClose();
        this.switchToSignup.emit();
    }
}
