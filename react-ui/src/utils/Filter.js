import axios from "axios";
import Mathy from './Mathy.js'
export default {
	getTop10ByScore: function(sortArr) {
		const top10 = []
		sortArr.sort((a,b) => {
			return a.score - b.score
		})
		for (var i = 0; i < 10; i++) {
			let a = sortArr.pop()
			top10.push(a)
		}
		return top10
	},



	// return daily raw difference averages
	// logic: plug in array of restaurants
	// filter by query_date. get an array with each unique day
	// get average for each day.
	convertDate: function(utc) {
		let queryDate = utc.replace(/ .*/,'');
		return queryDate
	},

	dailyDiffAvg: function(dataArr) {
		let obj = {}
		dataArr.forEach(item => {
			let uniqueDateArr = []
			let diffandDatesArr = Mathy.getDiffwithDate(item.checkins, 'checkins')
			console.log(diffandDatesArr)
			diffandDatesArr.map(each => {
				each.query_date = this.convertDate(each.query_date)
				let queryDate = each.query_date
				let index = uniqueDateArr.findIndex(x => x === queryDate)

				if (index === -1) {
					uniqueDateArr.push(queryDate)
				}
			})

			// loop through uniqueDateArr dates and use date to
			// filter by date to get average for each day
			// return day average as object for past 14 days
			// filters dates into indiv arrays dynamically
			
			uniqueDateArr.forEach(value => {
				let filteredDateArr = item.checkins.filter(each => each.query_date === value)
				
				if (obj.hasOwnProperty(value)) {
					obj[value].push(filteredDateArr[0].checkins)
				} else {
					obj[value] = [filteredDateArr[0].checkins]
				}
				
			})		
		})

	}

}