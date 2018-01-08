import React, {Component} from 'react';

export class Stats extends Component {
	constructor(props) {
		super(props)
	};

	componentDidMount() {
		const getTotals = this.props.getTotals;
		getTotals()
	};

	render() {
		return (
				<div className="stats">
					<h3>Avg Checkins </h3>
					<p>{this.props.checkinsAvg}</p>
					<h3>Avg rating count </h3>
					<p>{this.props.ratingCountAvg}</p>
					<h3>Avg review count </h3>
					<p>{this.props.reviewsAvg}</p>
					<h3>Total Checkins Mean</h3>
					<p>{this.props.totals.checkinsMean}</p>
					<h3> Total Ratings Mean</h3>
					<p>{this.props.totals.ratingsMean}</p>
					<h3> Total Reviews Mean</h3>
					<p>{this.props.totals.reviewsMean}</p>
					<select
					onChange={this.props.loadFilter}
					>
						<option value="all">All</option>
					  <option value="price">Price</option>
					  <option value="category">Category</option>
					</select>
			</div>
		)
	}	
}
