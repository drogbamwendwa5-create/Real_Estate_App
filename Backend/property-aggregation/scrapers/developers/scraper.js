const BaseScraper=require("../base/BaseScraper");
const sc=require("../../config/source.config");
class DeveloperScraper extends BaseScraper{
constructor(config){super("developers",config||{name:"Developer Websites",baseUrl:"",enabled:false,rateLimitMs:5000,headers:sc.defaults.headers});}
async scrapeListingPage(p){return[];}
async scrapePropertyDetail(u){return null;}
}
module.exports=DeveloperScraper;
