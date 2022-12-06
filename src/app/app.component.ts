import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public initialColor: string = 'tomato';
    public textAreaContent: string = `<strong style="color: ${this.initialColor}">Contexto:</strong> <i>escreva aqui</i>`;

    onValueChange($event: string) {
        console.log($event);
    }
}
