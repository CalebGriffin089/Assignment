import { Component, signal } from '@angular/core';

@Component({
  selector: '',
  templateUrl: './home.html',
  standalone: false,
})
export class Home {
  protected readonly title = signal('w4');
}
