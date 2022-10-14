class CalcController{
	
	constructor(){

		this._audio = new Audio('click.mp3');
		this._audioOnOff = false;
		this._lastOperator = '';
		this._lastNumber = '';
		this._operation = [];  //Ele irá guardar a informação que o usúario clicar.
		this._locale = 'pt-BR';
		this._displayCalcEl = document.querySelector('#display');
		this._timeEl = document.querySelector('#hora');
		this._dateEl = document.querySelector('#data');
		this._currentDate;
		this.initialize();
		this.initKeyBoard();
		this.initButtonsEvents();
		this.setLastNumberToDisplay();
		
	}

	pasToFromClipboard(){
		
		document.addEventListener('paste', e=>{
			
			let text = e.clipboardData.getData('Text');

			this.displayCalc = parseFloat(text);

		});

	}

	copyToClipboard(){
		
		let input = document.createElement('input');

		input.value = this.displayCalc;

		document.body.appendChild(input);

		input.select();

		document.execCommand("Copy");

		input.remove();

	}

	initialize(){

		//Irá fazer a hora ser atualizada

		this.setDisplayDateTime();

		setInterval(()=>{

			//currentDate retorna a intância de um novo date

			this.setDisplayDateTime();

		}, 1000);

		this.setLastNumberToDisplay();
		this.pasToFromClipboard();

		document.querySelectorAll('.btn-ac').forEach(btn=>{
			
			btn.addEventListener('dblclick', e=>{
				
				this.toggleAudio();

			});
		});

	}

	toggleAudio(){
		
		this._audioOnOff = !this._audioOnOff;

	}

	playAudio(){
		
		if (this._audioOnOff){
			
			this._audio.currentTime  = 0;
			this._audio.play();

		}

	}

	initKeyBoard(){
		
		document.addEventListener('keyup', e=>{

		this.playAudio();

		switch(e.key){

			case '.':
			case ',':

			this.addDot();
			break

		case 'Escape':

			this.clearAll();
			this.setLastNumberToDisplay();
			break

		case 'Backspace':

			this.clearEntry();
			this.setLastNumberToDisplay();
			break

		case '+':
		case '/':
		case '*':
		case '-':
		case '%':
			this.addOperation(e.key);
			break

		case 'Enter':
		case '=':
			this.calc();
			break

		//Os numeros abaixo não tem break, entao ele ira até onde tem break.

		case '0':
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':

			this.addOperation(parseInt(e.key));
			break

		case 'c':
					
			if(e.ctrlKey) this.copyToClipboard();
				break

			}
		})

	}

	//Função para receber varios eventos

	addEventListenerAll(element, events, fn){

		/*
			* element = tag
			* events = eventos
			* fn = funções
		*/

		events.split(' ').forEach(event=>{

			element.addEventListener(event, fn, false);

		})

	}

	clearAll(){

		this._operation = [];
		this._lastNumber = '';
		this._lastOperator = '';
		this.setLastNumberToDisplay();

	}

	clearEntry(){

		this._operation.pop();
		this.setLastNumberToDisplay();

	}

	//Pegando o ultimo valor

	getLastOperation(){

		return this._operation[this._operation.length -1];
	
	}

	setLastOperation(value){

		this._operation[this._operation.length - 1] = value;

	}

	//criamos essa função para saber se oq foi digitado é um operador.

	isOperator(value){

		return (['+', '-', '*', '/', '%'].indexOf(value) > -1);

	}

	pushOperation(value){

		//Quando a conta tiver mais de três elementos, ele executará.

		this._operation.push(value);

		if (this._operation.length > 3){

			this.calc();

		}
	}

	getResult(){

		try{
			
			return eval(this._operation.join(''));

		}catch(e){

			setTimeout(()=>{
				
				this.setError();

			}, 1);
		}
	}

	calc(){
		
		let last = '';

		/* Gambiarra (Resolva isso depois) */

		if(this._operation.length == 2){

			let firstItem = this._operation[0];
			this._lastOperator = this._operation[1];

			this._operation = [firstItem, this._lastOperator, this._lastNumber];

		}

		if(this._operation.length < 3){
			
			let firstItem = this._operation[0];
			
			//reecolocando os elementos para quando for concatenar

			this._operation = [firstItem, this._lastOperator, this._lastNumber];

		}


		this._lastOperator = this.getLastItem();

		if(this._operation.length > 3){

			last = this._operation.pop();
			this._lastNumber = this.getResult();

		}else if(this._operation.length == 3){
			
			this._lastNumber = this.getLastItem(false);

		}

		let result = this.getResult();

		if(last == '%'){

				result /= 100;
				this._operation = [result];

		}else{

			this._operation = [result];

			//Se last for diferente de vazio.

			if(last) this._operation.push(last);

		}

		this.setLastNumberToDisplay();

	}

	getLastItem(isOperator = true){
		
		let lastItem;

		for(let i = this._operation.length - 1; i >= 0; i--){

			//ultimo operador

			if(this.isOperator(this._operation[i]) == isOperator){
					
				lastItem = this._operation[i];
				break

			}
				
		};

		//Quando o operador sumir, ele irá continuar com o ultimo.

		if(!lastItem){
			
			lastItem = (isOperator) ? this._lastOperator : this._lastNumber;

		}

		return lastItem;
		

	}

	setLastNumberToDisplay(){

		let lastNumber = this.getLastItem(false);

		if(!lastNumber) lastNumber = 0
		this.displayCalc = lastNumber;

	}

	//Verificando se é um número ou String

	addOperation(value){

		//Esse if de baixo pergunta do ultimo valor digitado, o value dessa função é o valor atual digitado.

		if(isNaN(this.getLastOperation())){

			if (this.isOperator(value)){

				//trocar o operador

				this.setLastOperation(value);

			}else{

				this.pushOperation(value);

				this.setLastNumberToDisplay();

			}
			
		}else{
			
			if(this.isOperator(value)){
				
				this.pushOperation(value);

			}else{
				
				let newValue = this.getLastOperation().toString() + value.toString();
				this.setLastOperation(newValue);

				//Atualizar display

				this.setLastNumberToDisplay();
				
			}


		}

	}

	setError(){

		this.displayCalc = 'Error';

	}

	addDot(){

		let lastOperation = this.getLastOperation();

		if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

		//Se for um operador ou não tiver nd

		if (this.isOperator(lastOperation) || !lastOperation){
			
			this.pushOperation('0.');

		}else{

			this.setLastOperation(lastOperation.toString() + '.');

		}

			this.setLastNumberToDisplay();

	}

	execBtn(value){

		this.playAudio();

		switch(value){

			case 'ponto':
				

				this.addDot();
				break

			case 'ac':

				this.clearAll();
				this.setLastNumberToDisplay();
				break

			case 'ce':

				this.clearEntry();
				this.setLastNumberToDisplay();
				break

			case 'soma':
				this.addOperation('+');
				break

			case 'divisao':

				this.addOperation('/');
				break

			case 'multiplicacao':

				this.addOperation('*');
				break

			case 'subtracao':

				this.addOperation('-');
				break

			case 'porcento':
				this.addOperation('%');
				break

			case 'igual':

				this.calc();
				break

			//Os numeros abaixo não tem break, entao ele ira até onde tem break.

			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':

				this.addOperation(parseInt(value));
				break

			default:

				this.setError();
				break
		}
	}

	// btn é só um parâmetro para indicar cada botão da calculadora, quando apertamos nele botões são clicados

	initButtonsEvents(){

		let buttons = document.querySelectorAll('#buttons > g, #parts > g');

		buttons.forEach((btn, index)=>{

			this.addEventListenerAll(btn, 'click drag', e=>{

				let textBtn = btn.className.baseVal.replace('btn-', ''); //Pegando a classe do elemento, o .baseVal é pq é um svg
				this.execBtn(textBtn);

			});

			//adicionando o cursor poiter

			this.addEventListenerAll(btn, 'mouseover mouseup mousedown', e=>{
				btn.style.cursor = 'pointer';

			})
		});
	}

	setDisplayDateTime(){

		this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
			day: '2-digit',
		 	month:'long',
		 	year:'numeric'});

		this.displayTime = this.currentDate.toLocaleTimeString(this._locale); /*Esse vai ser o parâmetro do displayTime,
		 veja que ele está atribuindo ao diplayTime como se estivesse atribuindo ao set(E ele realmete está)*/
	}

	get displayTime(){

		return this._timeEl.innerHTML;

	}

	set displayTime(value){

		this._timeEl.innerHTML = value;

	}

	get displayDate(){

		return this._dateEl.innerHTML;

	}

	set displayDate(value){

		 this._dateEl.innerHTML = value;

	}

	get displayCalc(){

		return this._displayCalcEl.innerHTML;

	}

	set displayCalc(value){

		if(value.toString().length > 10){
			
			this.setError();
			return false;

		}

		this._displayCalcEl.innerHTML = value;

	}

	get currentDate(){

		return new Date();

	}

	set currentDate(data){

		this._currentDate = data;
		
	}
}
