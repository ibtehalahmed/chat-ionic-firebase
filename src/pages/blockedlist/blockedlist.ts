import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import * as firebase from 'firebase';

/**
 * Generated class for the BlockedlistPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-blockedlist',
  templateUrl: 'blockedlist.html',
})
export class BlockedlistPage {
  blockedList: any = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public dataProvider: DataProvider, public loading: LoadingProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BlockedlistPage');
    this.getAllBlockedConversation();
  }
  getAllBlockedConversation(){
    firebase.database().ref('accounts/'+firebase.auth().currentUser.uid+'/conversations').on('value', conversations =>{
      this.loading.show();
      let tmp = [];
      conversations.forEach( con => {
        if(con.val().blocked == true){
          let name;
          this.dataProvider.getUser(con.key).subscribe( data=>{ name = data.name; });
          tmp.push({
            id: con.key,
            name: name
          });
        }
        return false;
      });
      this.blockedList = tmp;
      this.loading.hide();
    });
    console.log(this.blockedList.length);
  }
  close(){
    this.viewCtrl.dismiss();
  }
  unblock(uid){
    console.log(uid);
    firebase.database().ref('accounts/'+firebase.auth().currentUser.uid+'/conversations/'+uid).update({
      blocked: false
    });
  }

}
