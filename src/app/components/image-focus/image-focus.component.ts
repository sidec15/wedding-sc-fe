import { NgIf } from '@angular/common';
import { Component, input, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-image-focus',
  imports: [NgIf],
  templateUrl: './image-focus.component.html',
  styleUrls: ['./image-focus.component.scss'],
})
export class ImageFocusComponent {
  imageUrl = input.required<string>();
  isVisible = input(false);
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
