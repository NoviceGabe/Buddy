define(() => {
	let flag = false;
	return class Modal{
		constructor(modal, trigger, form){
			this.modal = modal;
			this.trigger = trigger;
			this.form = form;
			this.close = modal.querySelector('.close');
			this.save = modal.querySelector('.save');
			this.cancel = modal.querySelector('.cancel');

			 this.trigger.addEventListener('click', () => {
			 	if(!flag){
			 		this.modal.style.display = 'flex';
			 		flag = true;
			 	}
               
            });

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
			this.trigger.addEventListener('click', () => {
			 	if(!flag){
			 		this.modal.style.display = 'flex';
			 		flag = true;
			 	}
			 	callback();
               
            });
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
