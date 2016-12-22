import React from 'react'
import ReactDOM from 'react-dom'

import WriterView from './writerView'
import $ from 'jquery'
import Header from './header'

var TweetView = React.createClass({
	getInitialState: function() {
		return {
			collection: this.props.collection,
			numberTweetsToDisplay: 0,
			displayButton: "block"
		}
	},

	_calculateRemainingTweets: function () {
		var numTweets = this.state.numberTweetsToDisplay,
			totalTweets = this.props.collection.models.length

			return numTweets + 5 <= totalTweets ? numTweets + 5 : totalTweets
	},

    _listenToCollection: function(collection) {

        var currentThis = this
        var updateState = function() {

            currentThis.setState({
                collection: currentThis.props.collection,
                numberTweetsToDisplay: 0,
                displayButton: currentThis.props.collection.models.length > 1 ? "block" : "none"
            })
        }
        var resetState = function() {
        	
        	currentThis.setState({
        		collection: currentThis.props.collection,
        		numberTweetsToDisplay: currentThis._calculateRemainingTweets(),
        		displayButton: currentThis.props.collection.models.length > 1 ? "block" : "none"
        	})
        }
        collection.on('update', updateState)
        collection.on('sync', resetState)
    },
    componentWillMount: function() {
        this._listenToCollection(this.props.collection)
    },
	componentWillReceiveProps: function(newProps) {
        this._listenToCollection(newProps.collection)
    },



	_displayMoreTweets: function() {
		var numTweets = this.state.numberTweetsToDisplay,
			totalTweets = this.props.collection.models.length
			console.log(this.state.numberTweetsToDisplay)
		this.setState({
			numberTweetsToDisplay: this._calculateRemainingTweets(),
			displayButton: (numTweets + 5) >= totalTweets ? "none" : "block"
		})
	},
	_getRemainingTweets: function() {
		var numTweets = this.state.numberTweetsToDisplay,
			totalTweets = this.state.collection.length,
			numToShow = 5

		if(numTweets + 5 >= totalTweets){
			numToShow = totalTweets % numTweets
		}
		return "Show " + numToShow + " more tweets"
	},
	render: function() {
		var moreTweetsButton = {
			display: this.state.displayButton
		}
		return (

			<div className="tweet-view">
				<Header />
				<WriterView />
				<TweetContainer collection={this.state.collection} tweets={this.state.numberTweetsToDisplay} />
				<button style={moreTweetsButton} onClick={this._displayMoreTweets}>
					{this._getRemainingTweets()}
				</button>
			</div>
			)
	}
})

var TweetContainer = React.createClass({
	_displayTweets: function() {
		console.log(this.props.collection)
		var jsxArr = [],
			tweetCollection = this.props.collection
		if(tweetCollection.length === 0){
			jsxArr.push(<h2>No tweets found</h2>)
		}
		for(var i = 0; i < this.props.tweets; i++){
			var tweetModel = tweetCollection.models[i]
			if(tweetModel.attributes.hasOwnProperty("user")){
				jsxArr.push(<Tweet model={tweetModel} />)
			}
		}
		return jsxArr;
	},
	render: function() {
		return (
			<div className="tweet-container">
				{this._displayTweets()}
			</div>	
			)
	}
})

var Tweet = React.createClass({


	_tweetDelete: function() {
		$.ajax({
    		url: 'https://twitclone-example.now.sh/api/tweet/'+ this.props.model.get("id"),
    		type: 'DELETE',
    		success: function(){window.location.reload(true)}
    		
    
		})

	},


	_getAvatarUrl: function() {
		var model = this.props.model,
			user = model.get("user")

		if(user !== null && user.hasOwnProperty("avatarURL")){
			return model.get("user").avatarURL
		} else {
			return "https://abs.twimg.com/icons/apple-touch-icon-192x192.png"
		}
	},
	_getUsername: function() {
		var model = this.props.model,
			user = model.get("user")

		if(user !== null && model.get("user").hasOwnProperty("username")){
			return model.get("user").username
		} else {
			return "Unknown"
		}
	},
	_getTimeElapsed: function(timeTweetCreated) {
		var then = new Date(timeTweetCreated),
			now = new Date(),
			millisecondsElapsed = (now-then)

		return this._getTimeFromMilliseconds(millisecondsElapsed)
	},
	_getTimeFromMilliseconds: function(milliseconds) {
		var seconds = Math.floor(milliseconds / 1000),
			minutes = Math.floor(seconds / 60),
			hours = Math.floor(minutes / 60),
			days = Math.floor(hours / 24),
			weeks = Math.floor(days / 7)

		if(seconds < 60){
			return seconds + "s"
		} else if(minutes < 60){
			return minutes + "m"
		} else if(hours < 24){
			return hours + "h"
		} else if(days < 7){
			return days + "d"
		} else{
			//replace this with the date tweet was posted
			//'57w', for example, is not helpful
			return weeks + "w"
		}
	},
	_hashParse: function(string) {
		var source = "#search/"+string.slice(1)
	    if(string.match(/#\w+/g)){
	    	return <a href={source}>{string} </a>
	    } else {
	    	return string + " "
	    }
	},
	_checkForHashes: function(content) {
		var splitContent = content.split(" "),
			newContentArr = []
		for(var i = 0; i < splitContent.length; i++){
			var word = splitContent[i],
				possibleHash = this._hashParse(word)
				newContentArr.push(possibleHash)
		}
		return newContentArr
	},

	render: function() {
		var model = this.props.model
		

		return (
			<div className="tweet">
				
				 
				<div className="tweet-header">
					<img src={this._getAvatarUrl()} />
					<strong>{this._getUsername()}</strong>
					<span>{this._getTimeElapsed(model.get("createdAt"))}</span>
				</div>
				<div className="tweet-content">
					<h5>{this._checkForHashes(model.get("content"))}</h5> 
				</div>
				<div className="tweet-nav">
					<span>{"replies " + model.get("replyToTweet")}</span>
					<span>{"likes " + model.get("likes")}</span>
					<button onClick={this._tweetDelete}> X </button>
				</div>

			</div>
			)
	}
})

export default TweetView