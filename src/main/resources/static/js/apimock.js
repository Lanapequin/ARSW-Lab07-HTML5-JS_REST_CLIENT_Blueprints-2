//@author hcadavid

apimock=(function(){

	var mockdata=[];

mockdata["johnconnor"] = [
        {author:"johnconnor", points:[{x:150, y:120}, {x:215, y:115}], name:"house"},
        {author:"johnconnor", points:[{x:340, y:240}, {x:15, y:215}], name:"gear"},
        {author:"johnconnor", points:[{x:100, y:200}, {x:180, y:220}], name:"tower"},
        {author:"johnconnor", points:[{x:60, y:90}, {x:120, y:130}], name:"fort"},
        {author:"johnconnor", points:[{x:300, y:150}, {x:350, y:180}], name:"crane"},
        {author:"johnconnor", points:[{x:400, y:300}, {x:420, y:310}], name:"bridge"},
        {author:"johnconnor", points:[{x:250, y:250}, {x:275, y:275}], name:"bunker"},
        {author:"johnconnor", points:[{x:90, y:60}, {x:110, y:80}], name:"shed"}
    ];

    mockdata["maryweyland"] = [
        {author:"maryweyland", points:[{x:140, y:140}, {x:115, y:115}], name:"house2"},
        {author:"maryweyland", points:[{x:140, y:140}, {x:115, y:115}], name:"gear2"},
        {author:"maryweyland", points:[{x:200, y:180}, {x:250, y:190}], name:"bridge"},
        {author:"maryweyland", points:[{x:130, y:160}, {x:170, y:180}], name:"tower2"},
        {author:"maryweyland", points:[{x:310, y:210}, {x:330, y:230}], name:"wheel"},
        {author:"maryweyland", points:[{x:50, y:50}, {x:75, y:75}], name:"hut"},
        {author:"maryweyland", points:[{x:180, y:100}, {x:200, y:120}], name:"garage"},
        {author:"maryweyland", points:[{x:90, y:220}, {x:130, y:240}], name:"lab"}
    ];

    mockdata["sarahkyle"] = [
        {author:"sarahkyle", points:[{x:90, y:60}, {x:120, y:80}], name:"hut"},
        {author:"sarahkyle", points:[{x:300, y:300}, {x:350, y:320}], name:"wheel"}
    ];

    mockdata["davemiller"] = [
        {author:"davemiller", points:[{x:400, y:100}, {x:420, y:130}], name:"shed"},
        {author:"davemiller", points:[{x:50, y:50}, {x:75, y:75}], name:"pulley"}
    ];


	return {
		getBlueprintsByAuthor:function(authname,callback){
			callback(
				mockdata[authname]
			);
		},

		getBlueprintsByNameAndAuthor:function(authname,bpname,callback){

			callback(
				mockdata[authname].find(function(e){return e.name===bpname})
			);
		}
	}	

})();

/*
Example of use:
var fun=function(list){
	console.info(list);
}

apimock.getBlueprintsByAuthor("johnconnor",fun);
apimock.getBlueprintsByNameAndAuthor("johnconnor","house",fun);*/