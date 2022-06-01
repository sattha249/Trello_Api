import fetch from "node-fetch"
import { readFileSync ,writeFile} from "fs"
import { createObjectCsvWriter } from 'csv-writer';
import pkg from "aws-sdk";
import {} from 'dotenv/config'
import member from './member.json' assert {type:'json'}
const {S3} = pkg

const key = process.env.API_KEY
const token = process.env.SECRET_API
const keyId = process.env.ACCESS_KEY
const secret = process.env.SECRET_KEY
const id = 'DP7O6uW5'   // board id 
const card_id = 'v2hNam6G'
const group = `?key=${key}&token=${token}`
const BUCKET_NAME = 'trelloapi';
const createCsvWriter = createObjectCsvWriter;
let memberId = ''
// connect to bucket
const s3 = new S3({
  accessKeyId: keyId,
  secretAccessKey: secret,
})




async function uploadFile (filename){

  const fileContent = readFileSync(filename)

  const params = {
    Bucket :BUCKET_NAME,
    Key: filename.slice(2),
    Body: fileContent
  }
  await s3.upload(params,function(err,data){
    if (err) throw err
    else console.log(`File uploaded ${filename.slice(2)}`)
  })
}




// information we can "GET"
const field = `https://api.trello.com/1/boards/${id}/name${group}` // show field on a board can change paremeters   /
const board_actions = `https://api.trello.com/1/boards/${id}/actions${group}`  // show action in board            /
const board_info = `https://api.trello.com/1/boards/${id}/${group}`  // show board details                        / no use
const members = `https://api.trello.com/1/boards/${id}/members${group}` // show board member username and fullname  / 
const memberIncard = `https://api.trello.com/1/members/${memberId}${group}`
const member_info = `https://api.trello.com/1/boards/${id}/memberships${group}` // show board member type and status    / no use
const checklist = `https://api.trello.com/1/boards/${id}/checklists${group}` // show checklist                  / no use
const list = `https://api.trello.com/1/boards/${id}/lists${group}` // show listname and status                     /
const list_filter = `https://api.trello.com/1/boards/${id}/lists/open${group}` // show list name by fillter (in parameters)   / no use
const card_actions = `https://api.trello.com/1/cards/${card_id}/actions${group}`  //card action (identify by card id)    /
const card_attach = `https://api.trello.com/1/cards/${card_id}/attachments${group}` // attach file in card
const all_card = `https://api.trello.com/1/boards/${id}/cards/all${group}` // attach file in card

async function getinfo(data){
return fetch(data, {
  method: 'get',
  headers: {
    'Accept': 'application/json'
  }
})
  .then(response => {
    return response.text();
  })
  .then(text =>{ 
  return JSON.parse(text)
})
  .catch(err => console.error(err));
}


// getAttachFile()
// getCardAction()
// getMemberInfo()
// getMember()
// getBoardAction()
// getField()
// getList()
// getAllCard()


// getMemberInCard()

async function getAttachFile(){

  var info = await getinfo(card_attach)
  const csvWriter = createCsvWriter({
    path: './AttachFile.csv',
    header: [
        {id: 'date', title: 'DATE'},
        {id: 'filename', title: 'FILENAME'},
        {id: 'url', title: 'URL'}
    ]
  });

const records = [
  ];

  console.log ("------------- attach file -------------")
  info.forEach(file => {
    console.log("date: " , file.date)
    console.log("Filename: " , file.name)
    console.log("File_URL",file.url)
    console.log("--------------------------------")
    records.push({date:file.date,filename:file.name,url:file.url})
    
  });
  
  await csvWriter.writeRecords(records)       // returns a promise
  .then(() => {
      console.log('...Done');
  });
  
  await uploadFile('./AttachFile.csv')

}


async function getCardAction(){
  var info = await getinfo(card_actions)
  info.forEach(action => {
    console.log("------------ card action ------------")
    console.log("card action by : ",action.memberCreator.fullName)
    console.log(JSON.parse(JSON.stringify(action.data)))
  });
}


async function getMemberInfo(){
  var info = await getinfo(member_info)
  console.log(info)
}

async function getMember(){
  var info = await getinfo(members)
  var dictstring = JSON.stringify(info)
  writeFile('member.json',dictstring,function(err,result){
    if (err) console.log(err)
  })
  const csvWriter = createCsvWriter({
    path: './Member.csv',
    header: [
        {id: 'fullname', title: 'FULLNAME'},
        {id: 'username', title: 'USERNAME'},
    ]
  });

const records = [
  ];

  console.log("--------------Member in board ---------------")
  info.forEach(member =>{
    console.log("Fullname: ",member.fullName)
    console.log("Username: ",member.username)
    console.log("----------------------------------")
    records.push({fullname:member.fullName,username:member.username})
  })
  await csvWriter.writeRecords(records)       // returns a promise
  .then(() => {
      console.log('...Done');
  });

  await uploadFile('./Member.csv')
}

// async function getMemberInCard(member){
//   
//   var info = await getinfo(memberIncard)
//   console.log(info)
 
// }


async function getBoardAction(){
  var info = await getinfo(board_actions)
  const csvWriter = createCsvWriter({
    path: './boardAction.csv',
    header: [
        {id: 'date',title:'DATE'},
        {id: 'boardname', title: 'BOARDNAME'},
        {id: 'type', title: 'TYPE'},
        {id: 'cardname', title: 'CARDNAME'},
        {id: 'fullname', title: 'FULLNAME'},
        {id: 'beforemove', title: 'BEFOREMOVE'},
        {id: 'aftermove', title: 'AFTERMOVE'},
    ]
  });

const records = [
  ];

  info.forEach(action => {
  console.log("Board name: " ,action.data.board.name)
  var boardname = action.data.board.name

  console.log("Action: " ,action.type)
  var actionType = action.type

  try{console.log("To: ",action.data.card.name)
  var cardname = action.data.card.name
  }catch{console.log("No card Modify")
  var cardname = null}

  console.log("By: ",action.memberCreator.fullName)
  var fullname = action.memberCreator.fullName

  try{
    console.log("move from: ",action.data.listBefore.name ," to : " , action.data.listAfter.name)
    var listbefore = action.data.listBefore.name
    var listafter = action.data.listAfter.name
  }catch(e){
    console.log ("Not moving")
    var listbefore = null
    var listafter = null
  }

  console.log("--------------------------")
  
  try{
  records.push({date:action.date,boardname:boardname,type:actionType,cardname:cardname,fullname:fullname,
  beforemove:listbefore,aftermove:listafter})
  }catch{}
  
});

await csvWriter.writeRecords(records)       // returns a promise
.then(() => {
    console.log('...Done');
});
 
await uploadFile('./boardAction.csv')
}

async function getField(){
  console.log("-------Board name --------")
  var info = await getinfo(field)
  return info._value
}

async function getList(){
  console.log("-------lists in board --------")
  var info = await getinfo(list)
  info.forEach(list => {
    console.log(list.name)
  });
}

async function getAllCard(){
  var info = await getinfo(all_card)
  const csvWriter = createCsvWriter({
    path: './GetAllCard.csv',
    header: [
        {id: 'name',title:'NAME'},
        {id: 'start', title: 'START'},
        {id: 'due', title: 'DUE'},
        {id: 'member', title: 'MEMBER'},
        {id: 'label_name', title: 'LABEL_NAME'},
        {id: 'label_color', title: 'LABEL_COLOR'}
    ]
  });

const records = [];

  info.forEach(card => {
    console.log("Card name : ",card.name)
    var start = card.badges.start == null ? "no start date assign" : card.badges.start
    console.log("Start date : ",start)
    var due = card.badges.due == null ? "no due date assign" : card.badges.due
    console.log("Due date : " ,due)
    var members = []
    if (card.idMembers.length > 0){   
        // console.log ("Member : " ,card.idMembers)
         card.idMembers.forEach(id => {
           member.forEach(member => {
             if (member.id == id){
               members.push(member.fullName)
             }
           });
         });
         console.log(members)
      }
    else{
      console.log("no member assign")
    }
    //label
    if (card.labels.length > 0){
      var name = []
      var color = []
     card.labels.forEach(label => {
        name.push(label.name)
        color.push(label.color)
      });
     console.log("label name : " ,name)
     console.log("label color : ",color)
    }
    else{
      console.log("no label name")
      var name = "no label name"
      console.log("no label color")
      var color = "no label color"
    }

    try{
      records.push({name:card.name,
        start:start,
        due:due,
        member:members,
        label_name:name,
        label_color:color
      })
      }catch{console.log('push error')}
     

    console.log("---------------------")
  });


  await csvWriter.writeRecords(records)       // returns a promise
  .then(() => {
    console.log('...Done');
  });

  await uploadFile('./GetAllCard.csv')
}