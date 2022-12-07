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

    hasTag(element: any, tag: string): boolean {
        let response: boolean = false;

        if (element && element.parentElement && element.parentElement.localName != "textarea" && element.parentElement.localName == tag) {
            response = true;
        } else {
            if (element && element.parentNode) {
                response = this.hasTag(element.parentNode, tag);
            }
        }

        return response;
    }

    modifyText(command: string, link?: string) {
        // Define a tag a ser inserida/removida
        let styleElement = document.createElement(command);

        // se for <a> coloca o link do href
        if (command === 'a' && link) {
            styleElement.setAttribute('href', link);
            styleElement.setAttribute('target', '_blank');
        }

        // Pega o objeto que representa o texto selecionado
        const userSelection = window.getSelection();
        
        // Testa se os dois existem para poder prosseguir
        if (userSelection && styleElement) {
            // Testa se o elemento selecionado possui a tag a ser inserida/removida
            if (this.hasTag(userSelection.anchorNode, command)) {
                // Deleta a tag
                this.deleteOuterElement((<HTMLElement>userSelection.anchorNode), command);
            } else {
                // Cria um elemento Range para envolver com a tag
                const selectedTextRange = userSelection.getRangeAt(0);
                // Insere a tag
                selectedTextRange.surroundContents(styleElement);
            }
        }

        userSelection?.removeAllRanges();
    }

    deleteOuterElement(htmlElement: HTMLElement, tag: string) {
        if (htmlElement) {
            if(htmlElement.nodeName.toUpperCase() == tag.toUpperCase()) {
                let insertNodes: Node[] = [];
                let parentEl: HTMLElement = htmlElement.parentElement ? htmlElement.parentElement : {} as HTMLElement;

                parentEl.childNodes.forEach((node: Node, i: number) => {
                    if(node == htmlElement) {
                        if(htmlElement.localName) {
                            htmlElement.childNodes.forEach((node: Node) => {
                                insertNodes.push(node);
                            })
                        } else {
                            insertNodes.push(document.createTextNode(htmlElement.nodeValue ? htmlElement.nodeValue : ""));
                        }
                    } else {
                        insertNodes.push(node);
                    }
                })

                parentEl.childNodes.forEach((node: Node) => {
                    parentEl.removeChild(node);
                })

                insertNodes.forEach((node: Node) => {
                    parentEl.appendChild(node);
                })                
            } else {
                if(htmlElement && htmlElement.parentElement) {
                    this.deleteOuterElement(htmlElement.parentElement, tag);
                }
            }
        }
    }
        
    link() {
        let userLink: string | null = prompt("Insira um link");
        
        if (userLink) {
            if (/http/i.test(userLink)) {
                console.log(userLink);
                this.modifyText(`a`, userLink);
            } else {
                userLink = "http://" + userLink;
                console.log(userLink);
                this.modifyText(`a`, userLink);
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
                block.style.paddingLeft = '16px';
                block.style.marginLeft = '16px';
                block.style.borderLeftColor = `${this._initialColor}`;
                block.style.borderLeftWidth = '3px';
                block.style.borderLeftStyle = 'solid';
            });
        }
        
        this.valueChange.emit(this.textarea.nativeElement.innerHTML);
    }

    getHTML(element: Element) {
        this.textarea.nativeElement.style.fontFamily = 'sans-serif';
        this.textarea.nativeElement.style.margin = '0';
        this.textarea.nativeElement.style.boxSizing = 'border-box';

        const htmlText: string = this.textarea.nativeElement.outerHTML;
        const data = new Blob([htmlText], {type: 'text/plain'});
        const textFile = window.URL.createObjectURL(data);

        element.setAttribute('href', textFile);
    }   
        
}