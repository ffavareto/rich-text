import { Component, ElementRef, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-rich-text',
    templateUrl: './rich-text.component.html',
    styleUrls: ['./rich-text.component.scss']
})
export class RichTextComponent implements OnInit {
    @ViewChild('textarea') textarea!: ElementRef<HTMLDivElement>;
    @ViewChild('formatBlock') formatBlock!: ElementRef<HTMLDivElement>;
    @Input() set initialColor(value: string) {
        this._initialColor = value;
    };
    @Input() set textAreaContent(value: string) {
        this._textAreaContent = value;
    };
    @Input() type: string = '';
    
    @Output()
    valueChanged: EventEmitter<string> = new EventEmitter<string>();
    
    public _textAreaContent: string = '';
    public _initialColor: string = '';
    
    constructor() { }
    
    ngOnInit(): void {
        const formatButtons: NodeListOf<Element> = document.querySelectorAll('.format')
        this.highlighter(formatButtons, true);
    }
    
    ngAfterViewInit() {
        this.textarea.nativeElement.innerHTML = this._textAreaContent;
        if (this.type !== "" && this.type === 'box') {
            this.textarea.nativeElement.style.backgroundColor = this._initialColor;
            this.formatBlock.nativeElement.style.display = 'none';
        } else {
            this.textarea.nativeElement.style.backgroundColor = 'white';
        }
    }

    findParentElement(element: Node, value: string): Node {
        let el: Node = {} as Node;

        if (
            (<HTMLElement>element).id == 'textarea' ||
            (element.parentElement && element.parentElement.localName == value)
        ) {
            el = element;
        } else {
            if (element.parentNode) {
                el = this.findParentElement(element.parentNode, value);
            }
        }

        return el;
    }
    
    public modifyText(command: string): void {
        let styleElement;
        const userSelection = window.getSelection();
        
        if (command == 'bold') {
            styleElement = document.createElement("strong");
        } else if (command == 'italic') {
            styleElement = document.createElement("i");
        }
        
        if (userSelection && styleElement) {
            if (
                command === 'bold' &&
                userSelection.anchorNode &&
                this.findParentElement(userSelection.anchorNode, 'strong').parentElement?.localName == 'strong'
            ) {
                this.deleteOuterElement(userSelection, (<HTMLElement>this.findParentElement(userSelection.anchorNode, 'strong')));
            } else {
                const selectedTextRange = userSelection.getRangeAt(0);
                selectedTextRange.surroundContents(styleElement);
            }
        }
    }

    deleteOuterElement(userSelection: Selection, htmlElement: HTMLElement) {
        if (userSelection.anchorNode && userSelection.anchorNode.parentElement) {
            let text = document.createTextNode(userSelection.anchorNode.parentElement.innerHTML);

            if (userSelection && userSelection.anchorNode && userSelection.anchorNode.parentNode && htmlElement.parentElement?.parentElement) {
                htmlElement.parentElement.parentElement.appendChild(text);
                htmlElement.parentElement.parentElement.removeChild(userSelection.anchorNode.parentNode);
            }
        }
    }
        
    public link(linkButton: Element): void {
        let userLink: string | null = prompt("Insira um link");
        let linkButtonID = linkButton.getAttribute('id');
        
        if (userLink && linkButtonID) {
            if (/http/i.test(userLink)) {
                this.modifyText(linkButtonID);
            } else {
                userLink = "http://" + userLink;
                this.modifyText(linkButtonID);
            }
        }
    }
        
    public highlighter(className: NodeListOf<Element>, needsRemoval: boolean): void {
        className.forEach((button) => {
            button.addEventListener("click", () => {
                
                if (needsRemoval) {
                    let alreadyActive = false;
                    
                    if (button.classList.contains("active")) {
                        alreadyActive = true;
                    }
                    
                    this.highlighterRemover(className);
                    if (!alreadyActive) {
                        button.classList.add("active");
                    }
                } else {
                    button.classList.toggle("active");
                }
            });
        });
    }
        
    public highlighterRemover(className: NodeListOf<Element>): void {
        className.forEach((button) => {
            button.classList.remove("active");
        });
    }
        
    public update(): void {
        const textArea = document.querySelector('.textarea');
        
        if (textArea) {
            let lis = textArea.querySelectorAll('li');
            let blocks = textArea.querySelectorAll('blockquote');
            
            lis.forEach(li => {
                li.setAttribute('style', `color: ${this._initialColor};`);
            });
            
            blocks.forEach(block => {
                block.setAttribute('style', `margin-left: 16px;`);
                block.setAttribute('style', `padding: 8px;`);
                block.setAttribute('style', `border-left: 3px solid ${this._initialColor};`);
            });
        }
        
        this.valueChanged.emit(this.textarea.nativeElement.innerHTML);
    }
        
}
    