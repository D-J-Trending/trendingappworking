import React, {Component} from 'react';
import { Input, Form, Searchbtn } from "../../components/Form";
import { Searched, Searcheditems, FbSearchedItems } from "../../components/Searched";
import Chart from "../../components/Chart";
import Sidenav from "../../components/Sidenav";
import API from "../../utils/API.js";
import { Details } from "../../components/Details"
import FilterData from "../../components/FilterData"
import "./findRestaurant.css";
import numjs from 'numjs';
import Mathy from "../../utils/Mathy.js";
import Yelp from "../../utils/Yelp.js";
import { CSSTransitionGroup } from 'react-transition-group' // ES6
import moment from 'moment';

//Need to pass value from input field
//Style chart and info into one element
//Allow to click on element to view stats
//Create separate chart components/arrays for rating, rating count, checkins, review count, star_rating

class findRestaurant extends Component {

	constructor (props) {
		super(props);
		this.state = {
			restaurantArr: [],
			restaurantName: "Homeroom",
			restaurantInfo: {},
			restaurantDetails: false,
			restaurantId: "",
			filter: 'price',
			filteredRestaurants: '',
			fbAPIResults: {},
			details: false,
			filteredTotal: "",
			allTotal: "",
			priceTotal: "",
			categoryTotal: "",
			totalAvg: "",
			chartData: {
					labels: [10,20],
					datasets: [
						{
							label: 'Difference',
							data: [11,21],
							backgroundColor: [
												'rgba(255, 99, 132, 0.2)',
										]
						}
					]
			},
			searchedRestaurant: {},
			showsidenav: true,
			showline: true,
			showbar: true
		};
	}
  
	componentDidMount() {
		API.AllReviews()
		.then(res => {
			console.log(res);
			console.log(res.data);
			this.setState({
				restaurantInfo: res.data
			})
		})
		.catch(err => console.log(err));
	}

  	//create labels and data arrays and sets chartData state
	generateChartData = (res) => {
		// const differenceArr = res[0].rating_count;		
		let labels = res.map(checkins => {
			let queryDate = checkins.query_date.replace(/ .*/,'');
			return queryDate;
		})
		//check if current data set is bigger, otherwise leave label state unchanged
		if(labels.length <= this.state.chartData.labels.length) {
			labels = this.state.chartData.labels;
		}
		const data = res.map(checkins => {
			return checkins.difference
		})
		//generate random color for new dataset
		const dynamicColors = function() {
            var r = Math.floor(Math.random() * 255);
            var g = Math.floor(Math.random() * 255);
            var b = Math.floor(Math.random() * 255);
            return "rgba(" + r + "," + g + "," + b + ", 0.2)";
        };

        let datalabel = '';

    	let index = this.state.chartData.datasets.findIndex( x => x.label === this.state.restaurantDetails.name)

    	if (index === -1) {
    		datalabel = this.state.restaurantDetails.name
    		console.log('doesn\'t exist, push label as is: ' + datalabel);
    	}
    	else {
    		datalabel = this.state.restaurantDetails.name + '1'
    		console.log('datalabel: ' + datalabel)
    	}

    	const labelArray = this.state.chartData.datasets.map(index => {
    		return index.label;
    	})

    	console.log(labelArray);

    	let numberoftimes = labelArray.filter(word => word === this.state.restaurantDetails.name+"1")

    	console.log("/"+this.state.restaurantDetails.name+"/");

    	console.log(numberoftimes);

		this.setState({
			chartData: {
				labels: labels,
				datasets: this.state.chartData.datasets.concat([
					{
						label: datalabel,
						data: data,
						backgroundColor: [dynamicColors()]
					}
				])
			}
		}, () => {
			console.log(this.state);
		})
	};

	loadRestaurants = () => {
		API.AllReviews()
		.then(res => {
		console.log(res)
		})
		.catch(err => console.log(err));
	};

	nameQuery = name => {
		API.nameQuery(name)
		.then(res => {
		console.log(res)
		})
		.catch(err => console.log(err));
	};

    //update state whenever field input changes
  handleInputChange = event => {
		const { name, value } = event.target;
		this.setState({
		  [name]: value
		});
	};

	searchRestaurant = event => {
		event.preventDefault();
		if (this.state.restaurantName) {
			const nameQue = (data) => {
				API.nameQuery(this.state.restaurantName)
				.then(res => {
					// if no result found, start add new firm functions
					// indexof, if data matches res.data, then take out
					let fbResults = []
					console.log(res)
					if (res.data[0]) {
						data.forEach(item => {

							if (item.id !== res.data[0].fbId) {
								fbResults.push(item)
							}
						})
					} else {
						fbResults = data
					}
					this.setState({
						fbAPIResults: fbResults,
						searchedRestaurant: res.data,
					})
					console.log(this.state);
					// this.generateChartData(this.state.restaurantInfo)
				})
				.catch(err => console.log(err));
			}

			// searches through fb api before sending it through db api
			const access = 'EAAG0XCqokvMBAPYkq18AYZCRVI1QaWb9HU9ti4PpFL5lZAL32p53Ql1zREzbBi9ikoXwdwgsyZB6Cjv9YjghpfQmWPZCBBtWMnGaqknAecNhQzpBNWKCZCFYM36P0IRP8QSnOlzHdxod6y8mZA3cOpdxlu7XZAtqIv9AhZBXdPyPsAZDZD'
			let url = 'https://graph.facebook.com/v2.7/search'
			let params = {
				type: 'place',
				q: this.state.restaurantName,
				center: '37.8044,-122.2711',
				distance: 10000,
				limit: 100,
				fields: 'name,single_line_address,phone, location,is_permanently_closed',
				access_token: access
			}
			API.APIsearch(url, params)
				.then(res => {
					console.log(res)
					nameQue(res.data.data)
				})
				.catch(err => console.log(err))

		}
  };

	showDetails = event => {
		const array = []
		const id = event.currentTarget.getAttribute('value');
		API.returnDetails(id)
			.then(res => {
				console.log(res.data[0])

				let checkinsAvg = this.findDifference(res.data[0].checkins, 'checkins')
				let reviewsAvg = this.findDifference(res.data[0].reviews, 'review_count')
				let ratingsAvg = this.findDifference(res.data[0].rating_count, 'rating_count')
				let diff = this.findDiff(res.data[0].checkins, 'checkins');
				let ratingDiff = this.findDiff(res.data[0].rating_count, 'rating_count');
				let reviewDiff = this.findDiff(res.data[0].reviews, 'review_count');
				let totalAvg = this.findTotalStats(this.state.restaurantInfo)

				this.setState({
					restaurantDetails: res.data[0],
					details: true,
					checkinsAvg: checkinsAvg,
					reviewsAvg: reviewsAvg,
					ratingsAvg: ratingsAvg,
					diffArr: diff,
					ratingDiff: ratingDiff,
					reviewDiff: reviewDiff,
					totalAvg: totalAvg
				})
				console.log(this.state)
				this.generateChartData(this.state.diffArr)
			})
			.catch(err => console.log(err))
	};

	//create an array with differences for all restaurants in restaurantInfo
	findPercentChange = () => {
		//array to hold the daily increase in ratings, reviews, checkins
		const allDifferences = []

		this.state.restaurantInfo.map(item => {
			let obj = {}
			let diff = this.findDiff(item.checkins, 'checkins')
			obj.yelpId = item.yelpId
			obj.diff = diff
			allDifferences.push(obj)
		})
		console.log(allDifferences)

		const compareAll = []
		// find difference week over week
		allDifferences.map(item => {
			//object to hold yelpId and weeklyChange
			let compare = {}
			let percentChange1 = 0
			let percentChange2 = 0
			let weeklyChange = 0
			let weeklyChangePercent = 0
			//first week
			item.diff.slice(0, 3).map(item => {
				percentChange1 += item.percentChange
				// console.log(item.percentChange)
			})
			//second week
			item.diff.slice(3, 6).map(item => {
				percentChange2 += item.percentChange
				// console.log(item.percentChange)
			})
			weeklyChange = percentChange2 - percentChange1
			compare.yelpId = item.yelpId
			compare.weeklyChange = weeklyChange
			compare.weeklyChangePercent = weeklyChange/percentChange1
			compareAll.push(compare)
		})
		console.log(compareAll)
	}

	findDiff = (arr, name) => {
		// returns an arry of obj with date and count
		const values = []
		for (var i = 0; i < arr.length; i++) {
			values.push({
				count: arr[i][name],
				query_date: arr[i]['query_date'],
			})
		}

		const diff = []
		for (var i = 0; i < values.length - 1; i++) {
			let difference = values[i+1]['count'] - values[i]['count']

			let val = difference / values[i]['count']
			let percentChange = Mathy.roundValue(val, -5)

			let query_date = values[i+1]['query_date']
			diff.push({
				difference: difference,
				percentChange: percentChange,
				query_date: query_date
			})
		}		
		return diff
	};

	findDifference = (arr, name) => {
		const values = []
		for (var i = 0; i < arr.length; i++) {
			values.push(arr[i][name])
		}
		const diff = []
		for (var i = 0; i < values.length - 1; i++) {
			let difference = values[i+1] - values[i]
			diff.push(difference)
		}
		let mean = Mathy.getMean(diff)
		return Mathy.roundValue(mean, -2)
	};

	findTotalStats = (arr) => {
		var checkins = [];
		var ratings = [];
		var reviews = [];
		const obj = {}
		for (var i = 0; i < arr.length; i++) {
			checkins.push(this.findDifference(arr[i].checkins, 'checkins'))
			ratings.push(this.findDifference(arr[i].rating_count, 'rating_count'))
			reviews.push(this.findDifference(arr[i].reviews, 'review_count'))
		}

		checkins = numjs.array(checkins);
		ratings = numjs.array(ratings);
		reviews = numjs.array(reviews);

		const checkinsMean = Mathy.roundValue(checkins.mean(), -6)
		const ratingsMean = Mathy.roundValue(ratings.mean(), -6)
		const reviewsMean = Mathy.roundValue(reviews.mean(), -6)

		obj.checkinsMean = checkinsMean
		obj.ratingsMean = ratingsMean
		obj.reviewsMean = reviewsMean

		return obj;
	};

	loadFilter = (ev) => {
		console.log(ev.target.value)

		if (ev.target.value === 'price') {
			this.setState({
				totalAvg: this.state.priceTotal
			})
		} else if (ev.target.value === 'all') {
			this.setState({
				totalAvg: this.state.allTotal
			})
		} else {
			this.setState({
				totalAvg: this.state.categoryTotal
			})
		}
	};

	getTotals = () => {
		// gets price total then sends to getalltotal, then getscategoriestotal
		API.filterSearch('price', this.state.restaurantDetails.price)
		.then(res => {
			const priceData = res.data
			let priceTotal = this.findTotalStats(priceData)
			getAllTotal(priceTotal, getCategoryTotal, priceData)
			
		})
		.catch(err => console.log('ERROR: ',err))
		
		const getAllTotal = (priceTotal, getCategoryTotal, priceData) => {
			const allTotal = this.findTotalStats(this.state.restaurantInfo)
			getCategoryTotal(priceTotal, allTotal, priceData)
		}
		
		const getCategoryTotal = (priceTotal, allTotal, priceData, eachDayTotal) => {
			let categoryTotal;
			let categories = this.state.restaurantDetails.categories
			let arrFirms = []
		
			categories.forEach(item => {
	
				API.filterSearch('category', item.title)
				.then(res => {
						const categoryData = res.data
						categoryData.forEach(item => {
							var index = arrFirms.findIndex(x => x.name === item.name)
	
							if (index === -1) {
								arrFirms.push(item)
							}	else {
								console.log('no push')
							}
						})
						categoryTotal = this.findTotalStats(arrFirms)
						this.setState({
							priceTotal: priceTotal,
							allTotal: allTotal,
							categoryTotal: categoryTotal
							})
				.catch(err => console.log(err))
				})
			})
		}
	};

	onClick = () => {
    this.setState({ showsidenav: !this.state.showsidenav });
   };

	showline = () => {
			this.setState({ showline: !this.state.showline });
	};

	showbar = () => {
			this.setState({ showbar: !this.state.showbar });
	};

	getYelpAddToDb = (ev) => {
		console.log('getYelpAddToDb')
		const id = ev.currentTarget.getAttribute('value')
		const name = ev.currentTarget.getAttribute('data-name')
		const city = ev.currentTarget.getAttribute('data-city')
		const address = ev.currentTarget.getAttribute('data-address')
		let phone
		if (ev.currentTarget.getAttribute('data-phone')) {
			phone = ev.currentTarget.getAttribute('data-phone')
			phone = Yelp.convertPhone(phone)
		} else {
			phone = null
		}
		
		// console.log(phone)
		Yelp.yelpAPI(id, name, address, phone, city)
	};

	render() {

		return (
		<div>
			<div className="wrapper">	
			{/*Main section*/}
				<button onClick={this.onClick}>showsidenav true</button> 
				<button onClick={this.showline}>showline</button> 
				<button onClick={this.showbar}>showbar</button> 
				<button onClick={this.findPercentChange}>finddiffall</button> 


		      	<div className="data-section columns">

		      		{ this.state.showsidenav ? 
		      			<div className="side-nav column is-2">
			      			<CSSTransitionGroup
								transitionName="example"
								transitionAppear={true}
								transitionAppearTimeout={500}
								transitionEnter={false}
								transitionLeave={true}>
				      			<Sidenav/>
				      		</CSSTransitionGroup>
			      		</div>  		
		      		: null }
		      		
		      		<div className="column auto">
		      			<div className='columns'>
		      				<div className="column is-12">
		      					<h1> Find A Restaurant </h1>
										<form>
											<Input
													value={this.state.restaurantName}
													onChange={this.handleInputChange}
													name="restaurantName"
													placeholder="restaurant"
											/>
											<Searchbtn
													disabled={!(this.state.restaurantName)}
													onClick={this.searchRestaurant}
											>
												Search Restaurant
											</Searchbtn>	
										
											<div id='search-restaurant'>
													{this.state.searchedRestaurant.length ? (
														<CSSTransitionGroup
													transitionName="example"
													transitionAppear={true}
													transitionAppearTimeout={500}
													transitionEnter={false}
													transitionLeave={true}>
															<Searched>
																{this.state.searchedRestaurant.map(restaurant => (
																	<Searcheditems className='searcheditems' key={restaurant._id} showDetails={(ev) => this.showDetails(ev)}
																		value={restaurant._id}
																	>              
																		<p> Name of Restaurant: {restaurant.name} </p>
																		<p> Address: {restaurant.location.address}, {restaurant.location.city}, {restaurant.location.state} </p>
																		<p> Data Summary: 
																			<ul>
																				<li>Yelp Rating: {restaurant.rating[0].rating} </li>
																				<li>Yelp URL: <a href={restaurant.yelpURL} target='blank'>{restaurant.name}</a></li>
																			</ul>
																		</p>
																	</Searcheditems>
																	))}
															</Searched>
														</CSSTransitionGroup>
												) : (
												<h3>No Results to Display</h3>
												)}
												<h4> FB API Search results </h4>
												{this.state.fbAPIResults.length ? (
													<CSSTransitionGroup
														transitionName="example"
														transitionAppear={true}
														transitionAppearTimeout={500}
														transitionEnter={false}
														transitionLeave={true}
													>
														<Searched>
															{this.state.fbAPIResults.map(restaurant => (
																<FbSearchedItems className='searcheditems' key={restaurant.id} getYelpAddToDb={(ev) => this.getYelpAddToDb(ev)}
																	value={restaurant.id}
																	dataName={restaurant.name}
																	dataAddress={restaurant.location.street}
																	dataCity={restaurant.location.city}
																	dataPhone={restaurant.phone}
																>
																	<p> Name of Restaurant: {restaurant.name} </p>
																	<p> Address: {restaurant.single_line_address} </p>
																	<p> Phone: {restaurant.phone} </p>
																</FbSearchedItems>
															))}
														</Searched>
													</CSSTransitionGroup>
												) : (
													<h4>No results from Facebook API </h4>
												)}
											</div> 		    
						    		</form>
		      				</div>
		      			</div>
		      			<div className='columns'>
			      			<div className="column is-three-fifths">
					      		<Chart className='charts' chartData={this.state.chartData} chartName="Average Checkins by Date"
					      		 showline={this.state.showline} showbar={this.state.showbar}legendPosition="top"/>
					      	</div>
					      	<div className="column auto">
					      		<div className="data-navigation">
					      			<p class='percentage'>+75% Increase</p>
					      			<p class='percentage'>-30% Decrease</p>
											{this.state.details ? (
												<Details 
													name={this.state.restaurantDetails.name}
													checkins={this.state.restaurantDetails.checkins}
													checkinsAvg={this.state.checkinsAvg}
													ratingCountAvg={this.state.ratingsAvg}
													reviewsAvg={this.state.reviewsAvg}
													totals={this.state.totalAvg}
													handleInputChange={this.handleInputChange}
													loadFilter={this.loadFilter}
													getTotals={() => this.getTotals()}
												/>
												) : (
												null
											)}
											{this.state.filteredRestaurants.length ? (
												<h4> Something </h4>
												// <FilterData />
											) : (
												<h4> Nothing </h4>
											)}
										</div>
									</div>
								</div>	
			    		</div>
			    	</div>

		      	{/*<div id='restaurants'>
			      	{this.state.restaurantInfo.length ? (
			        	<Searched>
			          	{this.state.restaurantInfo.map(restaurant => (
				            <Searcheditems key={restaurant._id} showDetails={(ev) => this.showDetails(ev)}
				            	value={restaurant._id}
				            >              
											<p> Name of Restaurant: {restaurant.name} </p>
											<p> Address: {restaurant.location.address}, {restaurant.location.city}, {restaurant.location.state} </p>
											<p> Data Summary: 
												<ul>
													<li>Yelp Rating: {restaurant.rating[0].rating} </li>
													<li>Yelp URL: <a href={restaurant.yelpURL} target='blank'>{restaurant.name}</a></li>
												</ul>
											</p>
				            </Searcheditems>
				          	))}
			       		</Searched>
						) : (
						<h3>No Results to Display</h3>
						)}
			    </div>*/}
				</div>
			
		</div>
	)
};
}

export default findRestaurant;