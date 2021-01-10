define(() => {
	return class Validator{

		static isNameValid(str){
			return str.match(/^(?=.{1,50}$)[a-zA-Z]+(?:['_.\s][a-zA-Z]+)*$/);
		}

		static isEmailValid(str){
			return str.match(/^([_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{1,6}))?$/);
		}

		static isPasswordValid(str){
			return str.match(/^[A-Z](?=.*\d)(?=.*[a-z])[\w~@#$%^&*+=`|{}:;!.?"()\[\]]{8,25}$/);
		}
	}
});