import React from 'react';
import * as d3 from 'd3';
import './Map.css';
import {dataSchema, visSchema, recommend, bind, createSymbolSvg} from './visualmodel.js';

class Map extends React.Component {
	constructor(props) {
		super(props);
		this.drawing = React.createRef();
		this.SVG_HEIGHT = this.props.height || 376;
		this.SVG_WIDTH = this.props.width || 575;
		this.MARKER_RADIUS = this.props.markerRadius || 5;
		this.MARKER_COLOR = this.props.markerColor || '#FFF';
		this.state = {
			// This is for heatmap (Array of objects{id, x, y, timeStamp}).
			locationData: [],
			// This is for tracking user (Object of object{id, name, location(array of points), trackingObj, hidden})
			userTrackingData: {},
		}
		// Recommend a notation taking into account the data fields present (dataSchema)
		// and the supported visualisation features (visSchema).
		// this.notation = recommend(
		// 	dataSchema,
		// 	visSchema
		// );
		// Log the notation ('bind_' properties represent visual properties that vary with data).

    console.log("cons notation:", props.notation);
    console.log("cons trackuserdata:", props.trackuserdata);
	}

	scaleMap(x, y, transform = 'top left') {
		this.svg.attr('transform', `scale(${x},${y})`).attr('transform-origin', transform);
	}

	addUtilitiesForMap() {

		// Tooltip that is shown when hovered above an area
		this.tooltip = d3.select("body")
			.append("div")
			.attr("class", "tooltip")

		this.lineFunction = d3.line()
			.curve(d3.curveCatmullRomOpen)
			// .curve(d3.curveCardinalOpen, 0.75)
			.x(function (d) { return (d.x - 1.0) * 1000/15; })
			.y(function (d) { return (d.y - 1.0) * 1000/15; })
	}

  // TODO: componentWillReceiveProps is depricated
	componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps notation:", nextProps.notation);
    console.log("componentWillReceiveProps trackuserdata:", nextProps.trackuserdata);

		nextProps.trackuserdata.forEach(user => this.trackUser(user))  
	}

  // componentDidUpdate() {
  //   console.log("componentDidUpdate");
  //   console.log("componentDidUpdate notation:", this.props.notation);
  //   console.log("componentDidUpdate trackuserdata:", this.props.trackuserdata);
  // 
  //   this.props.trackuserdata.forEach(user => this.trackUser(user))
  // }

	componentDidMount() {
		// Map data points.
    // TODO: World map
		const data = {
		}
		this.init_map(this.props.data || data);
		this.addUtilitiesForMap();

		// Find the scaling amount based on the parent div's height and width
		const xScale = document.getElementById("mapDiv").getBoundingClientRect().width / this.SVG_WIDTH;
		const yScale = document.getElementById("mapDiv").getBoundingClientRect().height / this.SVG_HEIGHT;
		this.scaleMap(xScale.toFixed(2), yScale.toFixed(2));

		// this.setState({ locationData: this.props.locationData || this.randomData() }, () => this.heatmap(this.state.locationData, Date.now(), Date.now() + 3600000))

		// Create a new layer for heatmap
		//this.heatmapLayer = this.svg.append('g');

		// Create a new layer for user tracking
		this.userTrackingLayer = this.svg.append('g');

		this.trackUser(this.props.trackuserdata);
    
    console.log("mount notation:", this.props.notation);
    console.log("mount trackuserdata:", this.props.trackuserdata);
	}

	init_map(dataPoints) {

		this.svg = d3.select(this.drawing.current).append('svg')
			.attr('height', this.SVG_HEIGHT)
			.attr('width', this.SVG_WIDTH);

		let lineFunction = d3.line()
			.x(function (d) { return d.x; })
			.y(function (d) { return d.y; })

		for (var key in dataPoints) {
			let data = dataPoints[key];

			this.svg.append("path")
				.attr("d", lineFunction(data.points))
				.attr("fill", data.color)
				.attr("class", data.info)
				.on("mouseover", () => this.tooltip.style("visibility", "visible").text(data.info))
				.on("mousemove", () => this.tooltip.style("top", (d3.event.pageY - 30) + "px").style("left", (d3.event.pageX + 10) + "px"))
				.on("mouseout", () => this.tooltip.style("visibility", "hidden"));
		}
	}

	randomData(numberOfData = 100) {
		let locationData = [];
		for (let i = 1; i <= numberOfData; i++) {
			let newData = {
				id: i,
				// x: Math.floor(Math.random() * this.SVG_WIDTH + 1),
				// y: Math.floor(Math.random() * this.SVG_HEIGHT + 1),
				// timestamp: new Date(Date.now() + Math.floor(Math.random() * 24 * 60 * 60 * 1000))
				...this.generateRandomLocation(Date.now(), new Date(Date.now() + 24 * 60 * 60 * 1000))
			}
			locationData.push(newData);
		}
		return locationData;
	}

	generateRandomLocation(startDate, endDate, height = this.SVG_HEIGHT, width = this.SVG_WIDTH) {
		let diff = endDate.getTime() - startDate.getTime();
		let new_diff = diff * Math.random();
		return {
			x: Math.floor(Math.random() * width),
			y: Math.floor(Math.random() * height),
			timestamp: new Date(startDate.getTime() + new_diff)
		}
	}

	heatmap(locationData, startTime, endTime) {
		this.heatmapLayer.selectAll('*').remove()
		const heatpoints = [];
		heatpoints.push(locationData.forEach(p => {
			if (p.timestamp > startTime && p.timestamp < endTime)
				return this.addPersonToHeatmap(p)
		}))
	}

	addPersonToHeatmap(location) {
		return this.heatmapLayer.append('circle')
			.attr('r', this.MARKER_RADIUS)
			.attr('cx', location.x)
			.attr('cy', location.y)
			.style('fill', this.MARKER_COLOR)
	}
		
	addNewUserToTrack(userData, visResult) {
		// Define custom markers for each user
		let data = [
			{ id: 0, name: 'start', height: 8, width: 8, size: visResult.marker_start.size, color: visResult.marker_start.color, shape: visResult.marker_start.shape, refX: 50, refY: 50, viewbox: "0 0 100 100" },
			{ id: 1, name: 'end', height: visResult.marker_end.size, width: visResult.marker_end.size, color: visResult.marker_end.color, shape: visResult.marker_end.shape, refX: 50, refY: 50, viewbox: "0 0 100 100" },
			{ id: 2, name: 'mid', height: 6, width: 6, color: visResult.color, shape: visResult.shape, refX: 50, refY: 50, viewbox: "0 0 100 100" }
		];

		let defs = this.svg.append('svg:defs');

		defs.selectAll('marker')
			.data(data)
			.enter()
			.append('svg:marker')
			.attr('id', function (d) { return 'marker_' + d.name + "_" + userData.id })
			.attr('markerHeight', function (d) { return d.height })
			.attr('markerWidth', function (d) { return d.width })
			.attr('refX', function (d) { return d.refX })
			.attr('refY', function (d) { return d.refX })
			.attr('viewBox', function (d) { return d.viewbox })
			.attr('orient', 'auto')
			.append(function(d) {
				// Generate custom SVG marker symbol with recommended color and shape
				return createSymbolSvg(d.color, d.shape);
			});

		return this.userTrackingLayer.append("path")
			.datum(visResult.path)
			.attr("d", this.lineFunction)
			.attr("fill", 'none')
			//.attr("stroke", visResult.line_style.color) // Stroke color will be chosen based on person id
			.attr("stroke", visResult.color) // Stroke color will be chosen based on person id
			.attr("class", 'person')
			.on("mouseover", () => this.tooltip.style("visibility", "visible").text(userData.name || userData.id))
			.on("mousemove", () => this.tooltip.style("top", (d3.event.pageY - 30) + "px").style("left", (d3.event.pageX + 10) + "px"))
			.on("mouseout", () => this.tooltip.style("visibility", "hidden"))
			.attr('marker-start', "url(#marker_start_" + userData.id + ")")
			.attr("marker-mid", "url(#marker_mid_" + userData.id + ")")
			.attr('marker-end', "url(#marker_end_" + userData.id + ")")
	}

	trackUser(userData) {

		if (!userData || Object.keys(userData).length === 0)
			return;

		// // Preprocess data
		// let personData = {
		// 	// Convert id to a bin. This is needed as there are
		// 	// a finite number of colours/textures available and
		// 	// potentially infinite ids.
		// 	"idbin": "bin" + (1 + userData.id % 3),
		// 	"person_start": {
		// 		// convert time to number (milliseconds since epoch). Then take diff. Then convert to days.
		// 		"time": (new Date("2019-02-01T00:00:00Z").getTime() - new Date("2019-01-01T00:00:00Z").getTime()) / (24 * 60 * 60 * 1000)
		// 	},
		// 	"person_end": {
		// 		// TODO: Extract start and end timestamps from userData.location
		// 		"time": (new Date("2019-10-01T00:00:00Z").getTime() - new Date("2019-01-01T00:00:00Z").getTime()) / (24 * 60 * 60 * 1000)
		// 	},
		// 	"person_path": userData.location
		// };

		// Bind notation to data (will substitute 'bind_' properties in the notation with actual data values)
		//let visResult = bind(this.notation, personData);

    console.log("track user")
    console.log(this.props.notation);
    console.log(userData);
		let visResult = bind(this.props.notation, userData);

		// Log the recommended visualisation (after binding to data, all visual properties will be constant)
		console.log("visResult:", visResult);

		// If the user does not exists then add it to map
		if (this.state.userTrackingData[userData.id] === undefined) {
			let newUser = {
				id: userData.id,
				location: visResult.path, // using the transformed result means that the location field name can be dataset dependent.
				name: userData.id, //userData.name,
				hidden: false
			}

			newUser.trackingObj = this.addNewUserToTrack(newUser, visResult);

			let newStateObj = Object.assign({}, this.state.userTrackingData);
			newStateObj[userData.id] = newUser;

			this.setState({ userTrackingData: Object.assign({}, newStateObj) });
		} else {
			// If user exists then add new locations.
			// Note: visResult.path may be different to userData.location. E.g. depending on the bindings specified by the notation, it may scale or swap the x and y axes.
			this.state.userTrackingData[userData.id].trackingObj.datum(visResult.path).transition().duration(1000).attr("d", this.lineFunction)

			let newStateObj = Object.assign({}, this.state.userTrackingData);
			newStateObj[userData.id].location = visResult.path; //userData.location;
			this.setState({ userTrackingData: Object.assign({}, newStateObj) });
		}
	}

  // TODO: Simplify to render result entirely using React rather than d3
	render() {
		return (
			<React.Fragment>
				{/* <h1>GWP Map</h1> */}
				<div ref={this.drawing} id="mapDiv"></div>
			</React.Fragment>
		);
	}
}

export default Map;
