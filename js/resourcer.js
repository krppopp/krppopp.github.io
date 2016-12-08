/**
*  William Malone
*
*  @author William Malone (www.williammalone.com)
*/

/*global window, WM, WM.dispatcher */

WM.resourcer = function (GLOBAL, WM, path) {
	
	"use strict";
	
	var that = WM.dispatcher(),
		resources = {},
		loadQueue = [],
		numResourcesToLoad,
		resourcesLoaded,
		resourceList = [],
		
		onResourceLoaded = function () {

				resourcesLoaded += 1;
				that.dispatchEvent("LOAD_PROGRESS", {
					current: resourcesLoaded, 
					total: numResourcesToLoad
				});

				if (resourcesLoaded === numResourcesToLoad) {
					that.dispatchEvent("RESOURCES_LOADED");
				}
			},
		
		addToLoadQueue = function (resource) {
			
			var i;
				
			for (i = 0; i < loadQueue.length; i += 1) {
				if (loadQueue[i] === resource) {
					return;
				}
			}			
			loadQueue.push(resource);
		},
		
		removeFromLoadQueue = function (resource) {
			
			var i;
				
			for (i = 0; i < loadQueue.length; i += 1) {
				if (loadQueue[i] === resource) {
					loadQueue.splice(i, 1);
					return;
				}
			}
		};
	
	that.add = function (url) {
		
		var i,
			error,
			resource;
			
		if (url === undefined) {
			WM.error({
				name: "ResourceUndefined",
				message: "Cannot load resource. Resource was undefined."
			});
			return;
		}
			
		if (resources[url] !== undefined) {
			//WM.debug("Resource already exists: " + url);
			return;
		}
		
		resource = {
			type: "IMAGE",
		 	image: new Image(),
			url: url,
			loaded: false
		};
		resources[url] = resource;
		resourceList.push(resource);
	};
	
	that.get = function (url) {
		
		return resources[url];
	};
	
	that.loadAll = function () {
	
		var key,
			resource,
			i;
		
		numResourcesToLoad = resourceList.length;
		
		resourcesLoaded = 0;
		
		for (i = 0; i < resourceList.length; i += 1) {
			resourceList[i].image.onload = onResourceLoaded;
		}
		for (i = 0; i < resourceList.length; i += 1) {
			resourceList[i].image.src =  path + resourceList[i].url;
			if (resourceList[i].url.match(/\./g) === null) {
				WM.warning({
					name: "MissingExtension",
					message: "No extension found for resource: " + path + resourceList[i].url
				})
			}
		}
	};

	return that;
};