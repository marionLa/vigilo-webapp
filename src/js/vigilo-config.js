import {request} from './utils';
import localDataManager from './localDataManager';

const CATEGORIES_URL=require('../public/categorielist.json');
const RESOLVABLE_CATEGORIES=[2,3,4,5,6,7,8,11,100]

export async function getInstances(all){
    if (localDataManager.isDev()){
      var scopes = []
      scopes.push({ 
        api_path: "https://vigilo.vallees-connectees.alsace/server",
        country: "France", 
        prod: true,
        scope: "68_ccvm",
        name: "Dev"});
    }
    else {
      var scopes = require('../public/cities.json');
      scopes = Object.entries(scopes).map((item)=>{
          item[1].name = item[0];
          return item[1]
      })

    
      if (!localDataManager.isBeta() && all == undefined){
          scopes = scopes.filter((item)=>item.prod)
      }
    }
    return scopes

}

export function getCategories() {

    return new Promise((resolve, reject) => {
        try {
            let toreturn = {};
            for (const category of CATEGORIES_URL) {
                if (category.catdisable !== true) {
                    category.catdisable = false;
                }
                category.i18n = {};
                for (const key of Object.keys(category)) {
                    if (key.startsWith("catname_")){
                        category.i18n[key.replace("catname_", "")] = category[key];
                    }
                }
                toreturn[category.catid] = {
                    id: category.catid,
                    name: category.catname,
                    i18n: category.i18n,
                    color: category.catcolor,
                    disable: category.catdisable,
                    resolvable: RESOLVABLE_CATEGORIES.includes(category.catid),
                };
            }
            resolve(toreturn);
        } catch (error) {
            console.error('Error parsing categories data:', error);
            reject(error);
        }
    });
};

var pkg= require('../../package.json');
export const VERSION = pkg.name+"-"+pkg.version;
export const VERSION_NUMBER = pkg.version;

export const IMAGE_MAX_SIZE=1500;

export function getInstance(){
    var instance = localStorage.getItem('vigilo-instance');
    if (instance == null){
        return instance
    } else {
        return JSON.parse(instance)
    }
}
async function setInstance(name, noreload){
    var instances = await getInstances(true)
    for (var i in instances){
        if (instances[i].name == name){
            localStorage.setItem('vigilo-instance', JSON.stringify(instances[i]))
            break;
        }
    }
    if (noreload !== true){
        let searchParams = new URLSearchParams(window.location.search)
        if (searchParams.has('instance')){
            searchParams.delete('instance');
            window.location.search = '?' + searchParams.toString();
        } else {
            window.location.reload()
        }
        
    }
}

window.setInstance = setInstance;
