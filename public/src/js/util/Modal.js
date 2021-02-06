define(() => {
	let flag = false;
	return class Modal{
		constructor(modal, form, trigger){
			this.modal = modal;
			this.trigger = trigger;
			this.form = form;
			this.close = modal.querySelector('.close');
			this.save = modal.querySelector('.save');
			this.cancel = modal.querySelector('.cancel');

			if(this.trigger){
				this.trigger.addEventListener('click', () => {
				 	this.open();
	            });	
			}

			 this.cancel.addEventListener('click', () => {
	            this.modal.style.display = 'none';
	            this.form.reset();
	            flag = false;
	        });

			this.close.addEventListener('click', () => {
	            this.modal.style.display = 'none';
	            this.form.reset();
	            flag = false;
	        });
		}

		onTrigger(callback){
			if(!this.trigger){
				return;
			}
			this.trigger.addEventListener('click', (e) => {
				e.stopPropagation();
			 	this.open(callback);
            });
		}

		open(callback){
			if(!flag){
				this.modal.style.display = 'flex';
				flag = true;
				if(typeof callback == 'function'){
					callback();
				}
			}
		}

		onCancel(onFinish){
			 this.cancel.addEventListener('click', () => {
	            this.modal.style.display = 'none';
	            flag = false;
	            if (typeof onFinish == 'function') {
	                if (onFinish()) {
	                    this.form.reset();
	                }
	            } else {
	                this.form.reset();
	            }
	        });
		}

		onSave(onSave, onFinish){
			  this.save.addEventListener('click', () => {
	            (async () => {
	                const status = await onSave();
	                
	                if (status) {

	                    this.modal.style.display = 'none';
	                    flag = false;

	                    if (typeof onFinish == 'function') {
	                        let finish = onFinish();

	                        if (typeof finish == 'function') {
	                            const result = finish();
	                           if(result === undefined || result === true){
	                                this.form.reset();
	                           }
	                        }else if(finish === undefined || finish === true){
	                            this.form.reset();
	                        }
	                         
	                    } else{
	                        this.form.reset();
	                    }
	                    
	                }
	            })();
	        });
		}

		onClose(onFinish){
			this.close.addEventListener('click', () => {
	            this.modal.style.display = 'none';
	            flag = false;
	            if (typeof onFinish == 'function') {
	                if (onFinish()) {
	                    this.form.reset();
	                }
	            } else {
	                this.form.reset();
	            }
	        });
		}

		onWindowClick(){
			 window.onclick = function(event) {
	            if (event.target == this.modal) {
	                this.modal.style.display = 'none';
	                this.form.reset();
	                flag = false;
	            }
	        }
		}

	}
});