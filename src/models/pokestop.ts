"use strict"

const pokestopsPath = 'pokestops.json';
const fs            = require('fs');

const lureTime = 1800;

class Pokestop {
    static Pokestops = {};

    id: string;
    lat: number;
    lon: number;
    name: string;
    url: string;
    enabled: boolean;
    lastModifiedTimestamp: number;
    lureId: number;
    lureExpireTimestamp: number;
    incidentExpireTimestamp: number;
    pokestopDisplay: number;
    gruntType: number;
    questType: number;
    questTarget: number;
    questTimestamp: number;
    questConditions: any;
    questRewards: any;
    questTemplate: string;
    updated: number;
    sponsorId: number;
    cellId: string;

    constructor(data: any) {
        if (data.fort !== undefined) {
            this.id = data.fort.id;
            this.lat = data.fort.latitude;
            this.lon = data.fort.longitude;
            if (data.fort.sponsor !== 0) {
                this.sponsorId = data.fort.sponsor;
            }
            this.enabled = data.fort.enabled;
            var lastModifiedTimestamp = data.fort.last_modified_timestamp_ms / 1000;
            if (data.fort.active_fort_modifier !== undefined && data.fort.active_fort_modifier !== null && data.fort.active_fort_modifier.length > 0) {
                if (data.fort.active_fort_modifier.includes(501) ||
                    data.fort.active_fort_modifier.includes(502) ||
                    data.fort.active_fort_modifier.includes(503) ||
                    data.fort.active_fort_modifier.includes(504)) {
                    this.lureExpireTimestamp = lastModifiedTimestamp + lureTime;
                    this.lureId = data.fort.active_fort_modifier[0].item_id;
                }
            }
            this.lastModifiedTimestamp = lastModifiedTimestamp;
            if (data.fort.image_url !== null) {
                this.url = data.fort.image_url;
            }
            if (data.fort.pokestop_display !== undefined && data.fort.pokestop_display !== null) {
                this.incidentExpireTimestamp = data.fort.pokestop_display.incident_expiration_ms / 1000;
                if (data.fort.pokestop_display.character_display !== undefined && data.fort.pokestop_display.character_display !== null) {
                    this.pokestopDisplay = data.fort.pokestop_display.character_display.style;
                    this.gruntType = data.fort.pokestop_display.character_display.character;
                }
            } else if (data.fort.pokestop_displays !== undefined && data.fort.pokestop_displays.length > 0) {
                this.incidentExpireTimestamp = data.fort.pokestop_displays[0].incident_expiration_ms / 1000;
                if (data.fort.pokestop_displays[0].character_display !== undefined && data.fort.pokestop_displays[0].character_display !== null) {
                    this.pokestopDisplay = data.fort.pokestop_displays[0].character_display.style;
                    this.gruntType = data.fort.pokestop_displays[0].character_display.character;
                }
            }
            this.cellId = data.cellId.toString();
        } else {
            this.id = data.id.toString();
            this.lat = data.lat;
            this.lon = data.lon;
            this.name = data.name;
            this.url = data.url;
            this.enabled = data.enabled;
            this.lureExpireTimestamp = data.lureExpireTimestamp;
            this.lastModifiedTimestamp = data.lastModifiedTimestamp;
            this.updated = data.updated;
            
            this.questType = data.questType;
            this.questTarget = data.questTarget;
            this.questTimestamp = data.questTimestamp;
            this.questConditions = data.questConditions;
            this.questRewards = data.questRewards;
            this.questTemplate = data.questTemplate;
    
            this.cellId = data.cellId.toString();
            this.lureId = data.lureId;
            this.pokestopDisplay = data.pokestopDisplay;
            this.incidentExpireTimestamp = data.incidentExpireTimestamp;
            this.gruntType = data.gruntType;
            this.sponsorId = data.sponsorId;
        }
    }
    static getAll() {
        return this.load();
    }
    static getById(pokestopId: string) {
        return this.Pokestops[pokestopId];
    }
    static getIn(ids: string[]) {
        return [];
    }
    static clearQuests(ids: string[]) {
    }
    addDetails(fort) {
        
    }
    addQuest(quest) {
        //TODO: Add quest
    }
    save() {
        //TODO: Check if values changed, if not skip.
        Pokestop.Pokestops[this.id] = this;
        save(Pokestop.Pokestops, pokestopsPath);
    }
    static load() {
        let data = fs.readFileSync(pokestopsPath);
        this.Pokestops = JSON.parse(data);
        return this.Pokestops;
    }
}

/**
 * Save object as json string to file path.
 * @param {*} obj 
 * @param {*} path 
 */
function save(obj: any, path: string) {
    fs.writeFileSync(path, JSON.stringify(obj, null, 2), 'utf-8');
}

// Export the class
export { Pokestop };