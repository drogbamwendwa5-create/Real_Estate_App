class V{validate(d){const e=[];if(!d.title)e.push("Missing title");if(!d.price)e.push("Missing price");return{isValid:e.length===0,errors:e,data:d};}}module.exports=V;
