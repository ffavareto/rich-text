import {
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild,
    Output,
    EventEmitter
} from '@angular/core';

@Component({
    selector: 'app-rich-text',
    templateUrl: './rich-text.component.html',
    styleUrls: ['./rich-text.component.scss']
})
export class RichTextComponent implements OnInit {
    @ViewChild('textarea') textarea!: ElementRef<HTMLDivElement>;
    @ViewChild('blockquote') blockquote!: ElementRef<HTMLDivElement>;
    @Input() set initialColor(value: string) {
        this._initialColor = value;
    };
    @Input() set textAreaContent(value: string) {
        this._textAreaContent = value;
    };
    @Input() type: string = '';
    
    @Output()
    valueChange: EventEmitter<string> = new EventEmitter<string>();
    
    public _initialColor: string = '';
    public _textAreaContent: string = '';
    
    constructor() { }
    
    ngOnInit() {
        const formatButtons: NodeListOf<Element> = document.querySelectorAll('.format')
        this.highlighter(formatButtons, true);
    }
    
    ngAfterViewInit() {
        this.textarea.nativeElement.innerHTML = this._textAreaContent;
        if (this.type !== "" && this.type === 'box') {
            this.textarea.nativeElement.style.backgroundColor = this._initialColor;
            this.blockquote.nativeElement.style.display = 'none';
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
    
    modifyText(command: string) {
        let styleElement;
        const userSelection = window.getSelection();
        styleElement = document.createElement(command);
        
        if (userSelection && styleElement) {
            if (userSelection.anchorNode && this.findParentElement(userSelection.anchorNode, command).parentElement?.localName == command) {
                this.deleteOuterElement(userSelection, (<HTMLElement>this.findParentElement(userSelection.anchorNode, command)));
            } else {
                const selectedTextRange = userSelection.getRangeAt(0);
                selectedTextRange.surroundContents(styleElement);
            }
        }
    }

    deleteOuterElement(userSelection: Selection, htmlElement: HTMLElement) {
        if (userSelection.anchorNode && userSelection.anchorNode.parentElement) {
            let el: Node = {} as Node;

            if(htmlElement.localName) {
                el = htmlElement;
            } else {
                el = document.createTextNode(userSelection.anchorNode.parentElement.innerHTML);
            }

            if (htmlElement.parentElement && htmlElement.parentElement.parentElement) {
                htmlElement.parentElement.parentElement.appendChild(el);
                htmlElement.parentElement.parentElement.removeChild(htmlElement.parentElement);
            }
        }
    }
        
    link() {
        let userLink: string | null = prompt("Insira um link");
        
        if (userLink) {
            if (/http/i.test(userLink)) {
                console.log(userLink);
                // this.modifyText(`<a href="${userLink}" target="blank"></a>`);
            } else {
                userLink = "http://" + userLink;
                console.log(userLink);
                // this.modifyText(`<a href="${userLink}" target="blank"></a>`);
            }
        }
    }
        
    highlighter(className: NodeListOf<Element>, needsRemoval: boolean) {
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
        
    highlighterRemover(className: NodeListOf<Element>) {
        className.forEach((button) => {
            button.classList.remove("active");
        });
    }
        
    update() {
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
        
        this.valueChange.emit(this.textarea.nativeElement.innerHTML);
    }
        
}
    