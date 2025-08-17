import { Component, signal } from '@angular/core';

@Component({
  selector: 'account',
  templateUrl: './account.html',
  standalone: false,
})
export class Account {
  protected readonly title = signal('w4');
}
