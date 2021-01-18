define(() => {

	return class Util{

		static getInitials(name){
			const matches = name.match(/\b(\w)/g);
			matches.join('');
			return matches;
		}

		static truncate(input, limit){
			if(input.length > limit){
				return  `${input.substring(0, limit)}...`;
			}
			return input;
		}

		static storeInWebStorage(key, arr){
		    localStorage.setItem(key, JSON.stringify(arr));
		}

		static retrieveFromWebStorage(key){
		    return JSON.parse(localStorage.getItem(key));
		}

		static toCapitalizeString(str) {
		   var splitStr = str.toLowerCase().split(' ');
		   for (var i = 0; i < splitStr.length; i++) {
		       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
		   }
		   return splitStr.join(' '); 
		}

		static getMatchesFromArray(array1, array2){
			var ret = [];
			array1.sort();
			array2.sort();
			for(var i = 0; i < array1.length; i++) {
			    if(array2.indexOf(array1[i]) > -1){
			        ret.push(array1[i]);
			    }
			}
			return ret;
		}

	}
});