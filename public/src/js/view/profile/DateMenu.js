define(()=>{
	return class DateMenu{
		constructor(selectYear, selectMonth, selectDay){

			const d = new Date();
			const month = d.getMonth();
			const year = d.getFullYear();
			const day = d.getDate();

			this.qntYears = 50;
			this.monthNames = ["January", "February", "March", "April", "May", "June",
    		"July", "August", "September", "October", "November", "December"
  			];

  			this.selectYear = selectYear;
  			this.selectMonth = selectMonth;
  			this.selectDay = selectDay;

  			let currentYear = new Date().getFullYear();

		  	for (let y = 0; y < this.qntYears; y++) {
			    let date = new Date(currentYear);
			    let yearElem = document.createElement("option");
			    yearElem.value = currentYear
			    yearElem.textContent = currentYear;
			    this.selectYear.append(yearElem);
			    currentYear--;
			 }

			 if(this.selectMonth){
			 	for (let m = 0; m < 12; m++) {
				    let month = this.monthNames[m];
				    let monthElem = document.createElement("option");
				    monthElem.value = m;
				    monthElem.textContent = month;
				    this.selectMonth.append(monthElem);
				}
			 }

			this.selectYear.value = 'empty';

			if(this.selectMonth && this.selectDay){
				this.selectYear.addEventListener('change', () => {
					this.AdjustDays();
				});
			}

			if(this.selectMonth){
				this.selectMonth.value = 'empty';
				this.selectMonth.addEventListener('change', () => {
					this.AdjustDays();
				});
			}
			
			if(this.selectDay){
				this.AdjustDays();
				this.selectDay.value = 'empty';

			}
		}

		AdjustDays() {
			let year = this.selectYear.value;
			let month = parseInt(this.selectMonth.value) + 1;
			let length = this.selectDay.options.length;
			for (let i = length-1; i >= 0; i--) {
				  this.selectDay.options[i] = null;
			}

			//get the last day, so the number of days in that month
			let days = new Date(year, month, 0).getDate();

			let def = document.createElement("option");
			def.value = 'empty';
			def.textContent = '';
			this.selectDay.append(def);
			//lets create the days of that month
			for (let d = 1; d <= days; d++) {
			    let dayElem = document.createElement("option");
			    dayElem.value = d;
			    dayElem.textContent = d;
			    this.selectDay.append(dayElem);
			}
		}
	}
});