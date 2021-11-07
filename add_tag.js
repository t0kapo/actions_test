//use in cli「node add_tag.js htmlfile(変更するHTMLの相対path)　jsfile_location(policyが記述された)  policy_name(追加したいポリシーの名前)　」
//package.json scriptsに"tagchange":"node add_tag.js"を追加した場合どうなる？
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const jquery = require("jquery");
const fs = require("fs");
const beautify_html = require("js-beautify").html;


//assign html file and policy javascript(japanese:HTMLファイルとJSファイルの中身を変数へ格納)
var file_str = String(process.argv[2]);
var file_js = String(process.argv[3]);
var policy_name = String(process.argv[4]);
let html = fs.readFileSync(file_str,"utf8");
let jscript = fs.readFileSync(file_js,"utf8");;

//change html using dom operation(jQuery) (japanese: 取得したHTMLをjsdomでDOMツリーにして、jQueryでDOM操作を行えるようにする)
var dom = new JSDOM(html);
const $ = jquery(dom.window);

if ($('meta[http-equiv="Content-Security-Policy"]').length){    //Trusted Types有効化用のmetaタグ(CSPヘッダ用)がある場合
	var check = String($('meta[http-equiv="Content-Security-Policy"]').attr("content"));
	console.log(check);
	const str_check =  new RegExp(policy_name);
	/*
	var script_list = [];                                       //HTML内のポリシーから、既にポリシーがあるか探す
	$("script[id='trusted_types']").each(function(index, value){
		script_list.push(value.text);
	})

	var num = new RegExp(policy_name);
	var check = script_list.filter(value => value.match(num));
	console.log(check.length);
	if (check.length > 0){
	*/
	if (str_check.test(check) ==  true){		//既に指定したポリシーがある場合
		console.log("The policy '"+ policy_name + "' already exists!!");									//何もしない 
	}else{
		$('meta[http-equiv="Content-Security-Policy"]').attr("content", function(index, val){ //新しいポリシーの場合、新しいポリシー名とポリシーを追加する
			return val + ' ' + policy_name;
		});
		$("body").prepend('<script id="trusted_types">' + jscript + '</script>');
	}
}else{
	$("head").append('<meta http-equiv="Content-Security-Policy" content="require-trusted-types-for \'script\';  trusted-types ' + policy_name +'">');
	$("body").prepend('<script id="trusted_types">' + jscript + '</script>');
}
	
var change_dom = dom.serialize();
//make code beautiful
var code_beautifier = beautify_html(change_dom);
//overwrite html file
fs.writeFile(file_str, code_beautifier, (err) => {
	if (err) throw err;
	console.log('');
});