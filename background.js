// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function () {

    var talRule = {
        conditions: [
            new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { 
                    urlMatches: 'thisamericanlife.org', 
                    schemes: ['https', 'http'] }
            })
        ],

        actions: [new chrome.declarativeContent.ShowPageAction()]
    }

    // Replace all rules ...
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        // With a new rule ...
        chrome.declarativeContent.onPageChanged.addRules([talRule]);
    });
});

// Called when the user clicks on the page action.
chrome.pageAction.onClicked.addListener(function (tab) {
    // No tabs or host permissions needed!

    // TAL episodes up to 634 are accessed differently than those 635 and above
    var EPISODE_CUTOFF = 635;

    // TAL episode urls break up into 
    // [https:]/[]/[www.thisamericanlife.org]/[EPISODE_NUMBER]/[whatever...]
    //    0      1             2                     3              4 ...
    var EPISODE_NUMBER_URL_SEGMENT = 3;
    
    // Get the episode data from the activeTab url
    var episode = getEpisodeFrom(tab.url);

    // If the url is a valid episode url
    if (episode.hasValidURL) {
        // Ask Chrome to download the audio file
        chrome.downloads.download({ 
            // Compose the appropriate url for the audio file
            url: composeAudioURLFrom(episode.number) 
        });
    }

    function getEpisodeFrom(url) {
        // Episode data object
        var episode = {
            hasValidURL: false,
            number: null
        };
        
        // Split the url by slashes
        var urlSegments = url.split('/');

        // Attempt to get the episode number
        var episodeNumber = parseInt(urlSegments[EPISODE_NUMBER_URL_SEGMENT], 10);

        // If the url appears right and the episode number is actually a number
        if (urlSegments.length > EPISODE_NUMBER_URL_SEGMENT && !isNaN(episodeNumber)) {
            // build and return a valid episode object
            episode.hasValidURL = true;
            episode.number = episodeNumber;            
            return episode;
        }

        // Return the default invalid episode object
        return episode;
    }

    // Returns the string URL for the audio file for the episode
    function composeAudioURLFrom(episodeNumber) {
        if (episodeNumber < EPISODE_CUTOFF) {
            return "http://audio.thisamericanlife.org/" + episodeNumber + "/" + episodeNumber + ".mp3";
        }
        else {
            return "https://www.podtrac.com/pts/redirect.mp3/podcast.thisamericanlife.org/extended/" + episodeNumber + ".mp3";
        }
    }


});