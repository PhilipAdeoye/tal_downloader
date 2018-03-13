// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function () {

    var talRule = {

        conditions: [
            new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostEquals: 'www.thisamericanlife.org', schemes: ['https', 'http'] }
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

    var audioURL = "";
    var episode = tryGetEpisodeNumber(tab.url);

    if (episode.validURL) {
        audioURL = composeAudioURL(episode.episodeNumber);
    }

    console.log(audioURL);

    if (audioURL) {
        chrome.downloads.download({ url: audioURL });
    }

    function tryGetEpisodeNumber(url) {
        var urlSegments = url.split('/');

        var episodeNumber = parseInt(urlSegments[3], 10);
        if (urlSegments.length > 3 && !isNaN(episodeNumber)) {
            return { validURL: true, episodeNumber: episodeNumber };
        }

        return { validURL: false, episodeNumber: null };
    }

    function composeAudioURL(episodeNumber) {

        if (episodeNumber < 635) {
            return "http://audio.thisamericanlife.org/" + episodeNumber + "/" + episodeNumber + ".mp3";
        }
        else {
            return "https://www.podtrac.com/pts/redirect.mp3/podcast.thisamericanlife.org/extended/" + episodeNumber + ".mp3";
        }
    }


});