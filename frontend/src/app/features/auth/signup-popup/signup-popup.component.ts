import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
    selector: 'app-signup-popup',
    templateUrl: './signup-popup.component.html',
    styleUrls: ['./signup-popup.component.scss']
})
export class SignupPopupComponent {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() switchToLogin = new EventEmitter<void>();

    signupForm: FormGroup;
    errorMsg = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.signupForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]]
        });
    }

    onSignup() {
        if (this.signupForm.invalid) return;

        this.authService.signup(this.signupForm.value).subscribe({
            next: () => {
                this.onClose();
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

    onSwitchToLogin() {
        this.onClose();
        this.switchToLogin.emit();
    }
}

