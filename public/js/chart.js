	$(document).ready(function(){

		var app = {};


		app.vm = function() {
			var socket = io.connect('http://localhost:3000')
				,serverData = []
				,chartData
				,parseTime = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse
				,formatTime = d3.time.format("%Y-%m-%d (%H:%M:%S)")
				,margin = {top: 30, right: 20, bottom: 30, left: 100}
			    ,width = 900 - margin.left - margin.right
			    ,height = 500 - margin.top - margin.bottom
			    ,x = d3.time.scale().range([0, width])
			    ,y = d3.scale.linear().range([height, 0])
			    ,xAxis = d3.svg.axis().scale(x)
						    .orient("bottom")
						    .ticks( 10 )
						    .tickFormat(d3.time.format('%H:%M:%S'))
				,yAxis = d3.svg.axis().scale(y)
		    				.orient("left").ticks( 10 )
		    	,valueLineZero = d3.svg.line()
						    .x(function(d) { return x(d.timestamp); })
						    .y(function(d) { return height; })
				,valueLine = d3.svg.line()
						    .x(function(d) { return x(d.timestamp); })
						    .y(function(d) { return y(d.value); })
				,valueAreaZero = d3.svg.area()
						    .x(function(d) { return x(d.timestamp); })
						    .y0(height)
						    .y1(function(d) { return height; })
				,valueArea = d3.svg.area()
						    .x(function(d) { return x(d.timestamp); })
						    .y0(height)
						    .y1(function(d) { return y(d.value); })
				,div = d3.select("body").append("div")   
						    .attr("class", "tooltip")               
						    .style("opacity", 0)
				,svg
				,dotTooltip = function (data) {
					svg.selectAll("circle").remove();
					svg.selectAll("dot")    
						    .data(data)         
						    .enter().append("circle")                               
						        .attr("r", 5)       
						        .attr("cx", function(d) { return x(d.timestamp); })       
						        .attr("cy", function(d) { return y(d.value); })
						            
						        .on("mouseover", function(d) {
						            div.transition()        
						                .duration(200)      
						                .style("opacity", .9);      
						            div.html(formatTime(d.timestamp) + "<br/><strong>Posts:</strong> "  + d.value)  
						                .style("left", (d3.event.pageX+10) + "px")     
						                .style("top", (d3.event.pageY - 28) + "px");    
						            })                  
						        .on("mouseout", function(d) {       
						            div.transition()        
						                .duration(500)      
						                .style("opacity", 0);   
						        });
				}
				,parseData = function (data){

					var all_data_by_date = {};
					var dates = [];
	       			var temp_date = 0;
					data.forEach(function(item, i) {

					    if( typeof item.post_impressions !== 'undefined' ) {

			        		var timestamp = item.post_impressions[0].timestamp;


			        		if( typeof all_data_by_date[timestamp] == 'undefined' ) {
			        			all_data_by_date[timestamp] = { 
			        				post_impressions: 0  
			        				, post_impressions_organic: 0  
			        				, post_impressions_viral: 0  
			        				, post_impressions_paid: 0  
			        				, posts: 0  
			        			};
			        			dates.push(timestamp);
			        			
			        		}

			        		all_data_by_date[timestamp].post_impressions += parseInt(item.post_impressions[0].value);
			        		all_data_by_date[timestamp].post_impressions_organic += parseInt(item.post_impressions_organic[0].value);
			        		all_data_by_date[timestamp].post_impressions_viral += parseInt(item.post_impressions_viral[0].value);
			        		all_data_by_date[timestamp].post_impressions_paid += parseInt(item.post_impressions_paid[0].value);


			        		all_data_by_date[timestamp].posts++;
		
			        	}

					});

					dates.sort(function(a, b){
						return a > b ? 1 : -1;
					});

					var ready_data = {
			        	post_impressions: { metrics: [], posts: 0},
			        	post_impressions_organic: { metrics: [], posts: 0},
			        	post_impressions_viral: { metrics: [], posts: 0},
			        	post_impressions_paid: { metrics: [], posts: 0}
			        };

			       
			       	dates.forEach(function(timestamp, i){

			        	var item = all_data_by_date[timestamp];
			        	var d3time = parseTime(timestamp);
			        	
			        	ready_data.post_impressions.metrics.push({ timestamp: d3time, value: parseInt(item.post_impressions)  });
			        	ready_data.post_impressions_organic.metrics.push({ timestamp: d3time, value: parseInt(item.post_impressions_organic) });
			        	ready_data.post_impressions_viral.metrics.push({ timestamp: d3time, value: parseInt(item.post_impressions_viral) });
			        	ready_data.post_impressions_paid.metrics.push({ timestamp: d3time, value: parseInt(item.post_impressions_paid) });


			        	ready_data.post_impressions.posts = item.posts;
			        	ready_data.post_impressions_organic.posts = item.posts;
			        	ready_data.post_impressions_viral.metrics.posts = item.posts;
			        	ready_data.post_impressions_paid.posts = item.posts;

			        });

			        return ready_data;

				}, 

				renderPostImpressions = function(data, delay, className) {
					//---------------------------
				    // post_impressions_organic
				    //---------------------------

				    svg.append("path")		// Add the valueLine path.
				    	.attr("class", className+" line")
				    	.attr("d", valueLineZero(data))
				    ;

				    svg.append("path")		// Add the valueArea path.
				    	.attr("class", className+" area")
				        .attr("d", valueAreaZero(data));
				    	
				    d3.select("."+className+".line")
				    	.transition().duration(1000)
				    	.attr("d", valueLine(data));

				    d3.select("."+className+".area")
				    	.transition().duration(1000)
				    	.attr("d", valueArea(data));

				    

				}

				,renderChart = function (parsedData) {

						var post_impressions = parsedData.post_impressions.metrics;
				        var post_impressions_organic = parsedData.post_impressions_organic.metrics;
				        var post_impressions_viral = parsedData.post_impressions_viral.metrics;
				        var post_impressions_paid = parsedData.post_impressions_paid.metrics;

				        // Scale the range of the data
					    x.domain(d3.extent(post_impressions, function(d) { return d.timestamp; }));
					    y.domain([0, d3.max(post_impressions, function(d) { return d.value; })]);

					    d3.select("svg").remove();
					    svg = d3.select("#chart")
						    .append("svg")
						        .attr("width", width + margin.left + margin.right)
						        .attr("height", height + margin.top + margin.bottom)
						    .append("g")
						        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

						renderPostImpressions(post_impressions, 1000, 'post_impressions');
						renderPostImpressions(post_impressions_viral, 1000, 'post_impressions_viral');
						renderPostImpressions(post_impressions_organic, 1000, 'post_impressions_organic');
						renderPostImpressions(post_impressions_paid, 1000, 'post_impressions_paid');

					    //---------------------------
					    // Axis
					    //---------------------------

					    svg.append("g")			// Add the X Axis
					        .attr("class", "x axis")
					        .attr("transform", "translate(0," + height + ")")
					        .call(xAxis);

					    svg.append("g")			// Add the Y Axis
					        .attr("class", "y axis")
					        .call(yAxis);
				}
				,loadImpressions = function() {
					d3.json("http://localhost:3000/get_impressions", function(error, data) {

						if( data.status === 'OK') {

					        var parsedData = parseData(data.response);
					        chartData = parsedData;
					        serverData = data.response;
					        renderChart (parsedData);

						}

						socket.on('newImpressions', function (data) {

        					
        					if( data.status === 'OK') {
        						

        						$.each(data.response, function(i, item){
        							serverData.push(item);
        						});

        						

        						var parsedData = parseData( serverData );

        						chartData = parsedData;

        						renderChart ( parsedData );

        					}
        				});

					});
				},

				renderSingle = function(data, className, el) {

					// Scale the range of the data
				    x.domain(d3.extent(data, function(d) { return d.timestamp; }));
				    y.domain([0, d3.max(data, function(d) { return d.value; })]);

				    d3.select("svg").remove();
				    svg = d3.select("#chart")
					    .append("svg")
					        .attr("width", width + margin.left + margin.right)
					        .attr("height", height + margin.top + margin.bottom)
					    .append("g")
					        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

					renderPostImpressions(data, 1000, className);

				    //---------------------------
				    // Axis
				    //---------------------------

				    svg.append("g")			// Add the X Axis
				        .attr("class", "x axis")
				        .attr("transform", "translate(0," + height + ")")
				        .call(xAxis);

				    svg.append("g")			// Add the Y Axis
				        .attr("class", "y axis")
				        .call(yAxis);

					dotTooltip(data);

					var $el = $(el);
					$el.parent().parent().find('li').removeClass('active');
					$el.parent().addClass('active');
				}

				showAll = function(ko_data, event){

					renderChart( chartData );
					
					var $el = $(event.currentTarget);
					$el.parent().parent().find('li').removeClass('active');
					$el.parent().addClass('active');
				},

				showTotal = function(ko_data, event){

					renderSingle(chartData.post_impressions.metrics, 'post_impressions', event.currentTarget);

				},
				showOrganic = function(ko_data, event){

					renderSingle(chartData.post_impressions_organic.metrics, 'post_impressions_organic', event.currentTarget);
				},
				showViral = function(ko_data, event){

					renderSingle(chartData.post_impressions_viral.metrics, 'post_impressions_viral', event.currentTarget);

				},
				showPaid = function(ko_data, event){

					renderSingle(chartData.post_impressions_paid.metrics, 'post_impressions_paid', event.currentTarget);

				}


			;

			return {
				
				svg: svg,
				parseData: parseData,
				loadImpressions: loadImpressions,
				renderChart: renderChart,
				showAll: showAll,
				showTotal: showTotal,
				showOrganic: showOrganic,
				showViral: showViral,
				showPaid: showPaid
			};

		} ();


		app.vm.loadImpressions();
    	ko.applyBindings(app.vm);
		

	});