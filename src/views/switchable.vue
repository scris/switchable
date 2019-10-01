<i18n src="@/assets/lang.json"></i18n>
<template>
    <div class="container">
      <loading :active.sync="loading" :can-cancel="false" :is-full-page="true" loader="bars"></loading>
      <div id="planselectorcontainer" class="linediv">
        <b-dd id="planselector" :text="thisplanname" variant="light">
          <b-dd-header id="dropdown-header-label">
            {{ $t('selectplan') }}
          </b-dd-header>
          <div v-if="plans.length">
            <b-dd-item-btn class="nohightlight" v-for="plan in plans" @click="chooseplan(plan.name)" :key="plan.id">{{ plan.name }}</b-dd-item-btn>
          </div>
          <div v-else class="taskpane"> 
            <b-dd-item-btn disabled>{{ $t('donthaveplan') }}</b-dd-item-btn>
          </div>
          <b-dd-divider></b-dd-divider>
          <b-dd-item-btn class="nohightlight bold" v-b-modal.plannamesubmitter>{{ $t('createplan') }}</b-dd-item-btn>
          <b-dd-item-btn class="nohightlight bold" v-b-modal.planmanager>{{ $t('manageplan') }}</b-dd-item-btn>
        </b-dd>&nbsp;&nbsp;
        <b-btn variant="light" v-b-modal.taskcreator class="bfa addtask topicon"><i class="fa fa-plus"></i> {{ $t('tasktext') }}</b-btn>
        <div class="btn closewindowcontainer" style="-webkit-app-region: no-drag; -webkit-user-select: none">
          <b-btn variant="light" class="bfa topicon" v-b-modal.settingspanel><i class="fa fa-sliders-h"></i></b-btn>
          <a v-if="iselectron" class="btn bfa closewindow topicon btn-light" href="javascript:window.close()"><i class="fa fa-times"></i></a>
        </div>
      </div>
      <div class="linediv" id="relative" v-if="thisplantype == 'relative'">
        <b-btn class="relativebtn" variant="light" v-if="!starttime_bool" v-b-modal.relativeconfirmer>{{ $t('startrplan') }}</b-btn>
        <b-btn class="relativebtn" variant="light" v-if="starttime_bool" @click="gNew">{{ $t('outrplan') }}</b-btn>
      </div>
      
      <div id="notifies" style="-webkit-app-region: no-drag">
        <div v-if="oncetask.length">
          <div class="linediv notify" v-for="task in oncetask" :key="task.id">
            <div class="notifypane" v-if="task.plan == thisplantoken"><span class="notifyname" v-bind:class="{ finishedoncetask: task.finished }">{{ task.name }}</span>&nbsp;<small class="text-muted once" v-if="!task.finished">{{ $t('tonce') }}</small><small class="text-muted once" v-if="task.finished">{{ $t('finishedoncetask') }}</small></div>
            <div class="notifypane" v-if="task.plan == thisplantoken">
              <span class="notifytime" v-bind:class="{ finishedoncetask: task.finished }">{{ task.time }}</span>
              <button class="notifymodify notifyedit bfa"  v-bind:class="{ finishedoncetask: task.finished }" @click="onceeNew(task.name,task.time,task.id)" v-b-modal.oncetaskedit>
                <!-- bfa = button with font-awesome -->
                <i class="fa fa-edit"></i>
              </button>
              <button class="notifymodify notifydelete bfa" v-bind:class="{ finishedoncetask: task.finished }" @click="oncedNew(task.id)" v-b-modal.oncedeleteconfirmer>
                <i class="fa fa-ban"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div id="notifies" style="-webkit-app-region: no-drag">
        <div v-if="thisplan.length">
          <div class="linediv notify" v-for="task in thisplan" :key="task.id">
            <div class="notifypane"><span class="notifyname">{{ task.name }}</span></div>
            <div class="notifypane">
              <span class="notifytime">{{ task.time }}</span>
              <button class="notifymodify notifyedit bfa" v-b-modal.taskedit @click="eNew(task.name,task.time,task.index)">
                <!-- bfa = button with font-awesome -->
                <i class="fa fa-edit"></i>
              </button>
              <button class="notifymodify notifydelete bfa" v-b-modal.deleteconfirmer @click="dNew(task.index)">
                <i class="fa fa-ban"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <b-modal
        id="plannamesubmitter"
        :title="$t('ptitle')"
        ref="pmodal"
        @show="pNew"
        @ok="pSubmit"
        :ok-title="$t('submit')"
        :cancel-title="$t('cancel')">
        <form ref="pform">
          <input type="text" style="display:none;"/>
          <b-form-group
            :label="$t('pname')"
            label-for="pname-input"
          >
            <b-form-input
              id="pname-input"
              v-model="planname"
              :placeholder="$t('pplanname')"
              required
              @keyup.enter.native="pSubmit"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('ptimetype')"
            label-for="ptype-input">
            <b-form-select
              id="ptype-input"
              v-model="plantimetype"
              :options="plantimetypeoptions"
              @keyup.enter.native="pSubmit"
            ></b-form-select>
            <b-tooltip target="ptype-input" varient="light">{{ $t('timetypedescription') }}</b-tooltip>
          </b-form-group>
        </form>
      </b-modal>
      <b-modal
        id="planmanager"
        ref="mmodal"
        :title="$t('petitle')"
        ok-only
        :no-enforce-focus="true"
        :ok-title="$t('close')">
        <b-list-group v-if="plans.length">
          <b-list-group-item button v-for="plan in plans" :key="plan.id" @click="planModify(plan.id)">{{ plan.name }}</b-list-group-item>
        </b-list-group>
        <div v-if="pmbvisibility">
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" role="tab" class="p-1">
              <b-button block href="#" v-b-toggle.accordion-edit variant="light" @click="peNew">{{ $t('peedit') }} {{ editplanname }}</b-button>
            </b-card-header>
            <b-collapse id="accordion-edit" accordion="pmb-accordion" role="tabpanel">
              <b-card-body>
                <form ref="peform" @submit="peSubmit" @reset="peNew">
                  <input type="text" style="display:none;"/>
                  <b-form-group :label="$t('pname')" label-for="pename-input">
                    <b-form-input id="pename-input" v-model="editplanname" required @keyup.enter.native="peSubmit"></b-form-input>
                  </b-form-group>
                  <b-form-group :label="$t('ptimetype')" label-for="petype-input" @keyup.enter.native="peSubmit">
                    <b-form-select id="ptype-input" v-model="editplantimetype" :options="plantimetypeoptions"></b-form-select>
                    <b-tooltip target="ptype-input" varient="light">{{ $t('timetypedescription') }}</b-tooltip>
                  </b-form-group>
                  <b-button type="reset" variant="light" v-b-toggle.accordion-edit>{{ $t('cancel') }}</b-button>
                  <b-button type="submit" variant="light" v-b-toggle.accordion-edit>{{ $t('submit') }}</b-button>
                </form>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" role="tab" class="p-1">
              <b-button block href="#" v-b-toggle.accordion-delete variant="light" @click="peNew">{{ $t('pedelete') }} {{ editplanname }}</b-button>
            </b-card-header>
            <b-collapse id="accordion-delete" accordion="pmb-accordion" role="tabpanel">
              <b-card-body>
                <b-card-text>{{ $t('pedeletecheck') }}</b-card-text>
                <b-button variant="light" v-b-toggle.accordion-delete>{{ $t('cancel') }}</b-button>
                <b-button variant="light" v-b-toggle.accordion-delete @click="pdSubmit">{{ $t('submit') }}</b-button>
              </b-card-body>
            </b-collapse>
          </b-card>
        </div>
      </b-modal>
      <b-modal
        id="taskcreator"
        ref="tmodal"
        :title="$t('ttitle')"
        @ok="tSubmit"
        @show="tNew"
        :ok-title="$t('submit')"
        :cancel-title="$t('cancel')">

        <form ref="tform">
          <input type="text" style="display:none;"/>
          <b-form-group
            :label="$t('tname')"
            label-for="tname-input"
          >
            <b-form-input
              id="tname-input"
              v-model="taskname"
              :placeholder="$t('ttaskname')"
              required
              @keyup.enter.native="tSubmit"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('ttime')"
            label-for="timeinput"
          >
            <timepicker v-model="tasktime" :only-time="true" format="HH:mm" formatted="HH:mm" :inline="false" :label="$t('selecttime')" color="darkred" :noClearButton="true" :noLabel="true" @keyup.enter.native="tSubmit"></timepicker>
          </b-form-group>
          <b-form-group :label="$t('tmore')">
            <b-form-checkbox
              id="once"
              v-model="isonce"
              name="once"
              value="once"
              unchecked-value="isntonce"
              v-b-tooltip.hover :title="$t('toncedescription')">
                {{ $t('tonce') }}
            </b-form-checkbox>
          </b-form-group>
        </form>
      </b-modal>
      <b-modal
        id="taskedit"
        ref="emodal"
        :title="$t('etitle')"
        @ok="eSubmit"
        :ok-title="$t('submit')"
        :cancel-title="$t('cancel')">
        <form ref="eform">
          <input type="text" style="display:none;"/>
          <b-form-group
            :label="$t('tname')"
            label-for="ename-input"
          >
            <b-form-input
              id="ename-input"
              v-model="edittaskname"
              required
              @keyup.enter.native="eSubmit"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('ttime')"
            label-for="etimeinput"
          >
            <timepicker v-model="edittasktime" :only-time="true" format="HH:mm" formatted="HH:mm" :inline="false" :label="$t('selecttime')" color="darkred" :noClearButton="true" :noLabel="true" @keyup.enter.native="eSubmit"></timepicker>
          </b-form-group>
        </form>
      </b-modal>
      <b-modal
        id="deleteconfirmer"
        :title="$t('confirm')"
        ref="dcmodal"
        :ok-title="$t('submit')"
        :cancel-title="$t('cancel')"
        @ok="dSubmit"> 
        {{ $t('dctext') }}
      </b-modal>
      <b-modal
        id="oncetaskedit"
        ref="oemodal"
        :title="$t('etitle')"
        @ok="onceeSubmit"
        :ok-title="$t('submit')"
        :cancel-title="$t('cancel')">
        <form ref="eform">
          <input type="text" style="display:none;"/>
          <b-form-group
            :label="$t('tname')"
            label-for="oename-input"
          >
            <b-form-input
              id="oename-input"
              v-model="onceedittaskname"
              required
              @keyup.enter.native="onceeSubmit"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('ttime')"
            label-for="oetimeinput"
          >
            <timepicker v-model="onceedittasktime" :only-time="true" format="HH:mm" formatted="HH:mm" :inline="false" :label="$t('selecttime')" color="darkred" :noClearButton="true" :noLabel="true" @keyup.enter.native="onceeSubmit"></timepicker>
          </b-form-group>
        </form>
      </b-modal>
      <b-modal
        id="oncedeleteconfirmer"
        :title="$t('confirm')"
        ref="odcmodal"
        :ok-title="$t('submit')"
        :cancel-title="$t('cancel')"
        @ok="oncedSubmit"> 
        {{ $t('dctext') }}
      </b-modal>
      <b-modal
        id="relativeconfirmer"
        :title="$t('confirm')"
        ref="rcmodal"
        :ok-title="$t('submit')"
        @ok="rSubmit"> 
        {{ $t('rctext') }}
      </b-modal>
      <b-modal
        id="relativegetoutconfirmer"
        @ok="gSubmit"
        :title="$t('confirm')"
        ref="rgcmodal"
        :ok-title="$t('submit')">
        {{ $t('rgctext') }}
      </b-modal>
      <b-modal
        id="fillnoticer"
        ok-only
        :title="$t('confirm')"
        ref="fnmodal"
        :ok-title="$t('submit')">
        {{ $t('fntext') }}
      </b-modal>
      <b-modal
        id="leftmorenoticer"
        ok-only
        :title="$t('confirm')"
        ref="lmnmodal"
        :ok-title="$t('submit')">  
        {{ $t('lmntext') }} 
      </b-modal>
      <b-modal
        id="loggingoutconfirmer"
        @ok="logout"
        :title="$t('confirm')"
        ref="locmodal"
        :ok-title="$t('submit')"
        :cancel-title="$t('cancel')">  
        {{ $t('loctext') }}
      </b-modal>
      <b-modal
        id="settingspanel"
        ok-only
        :title="$t('stitle')"
        ref="smodal"
        :ok-title="$t('close')">
        <b-row>
          <b-col sm="2" class="settingsleftbar"><small>{{ $t('saccount') }}</small></b-col>
          <b-col>
            <b-btn v-if="islogin" v-b-modal.loggingoutconfirmer>{{ $t('slogout') }}</b-btn>
            <b-btn v-if="!islogin" @click="gologin">{{ $t('slogin') }}</b-btn>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="2" class="settingsleftbar"><small>{{ $t('slocale') }}</small></b-col>
          <b-col><b-btn @click="i18nchinese">中文</b-btn><b-btn @click="i18nenglish">English</b-btn></b-col>
        </b-row>
        <b-row>
          <b-col sm="2" class="settingsleftbar"><small>{{ $t('saboutbar') }}</small></b-col>
          <b-col>
            <small class="form-text text-muted" id="abouttext">
              {{ $t('sabout') }} {{ version }} <br> 
              {{ $t('proud') }} <br> 
              {{ $t('sauthor') }} <a class="text-muted-icon" href="https://github.com/scris" target="_blank"><i class="fab fa-github"></i></a>&nbsp;<a class="text-muted-icon" v-if="!isonios" href="mailto:tianze@scris.top" target="_blank"><i class="fa fa-envelope"></i></a> {{ $t('sothercontributor') }} <br>
              {{ $t('scontribute') }} <a class="text-muted-icon" href="https://github.com/scris/switchable/" target="_blank"><i class="fab fa-github"></i></a>
            </small>
          </b-col>
        </b-row>
      </b-modal>
    </div>
</template>

<script>
  import AV from 'leancloud-storage';
  import notify from '@/components/linxf/notify';
  import loading from 'vue-loading-overlay';
  import 'vue-loading-overlay/dist/vue-loading.css';
  import { Plugins } from '@capacitor/core';
  import timepicker from 'vue-ctk-date-time-picker';
  import '@/assets/vue-ctk-date-time-picker.css';
  const { Storage } = Plugins;
  var Plan = AV.Object.extend('switchable_plans');
  var Oncetask = AV.Object.extend('switchable_oncetasks');
  var alarm = new Audio();
  var _this = null;
  alarm.src = require("@/assets/alarm.mp3");
  export default {
    name: 'switchable',
    components: {
      loading,
      timepicker,
    },
    data() {
      return {
        time: '00:00',
        thisplan: [],
        i_thisplan: 0,
        thisplanname: '',
        thisplantype: 'absolute',
        thisplanindex: 1,
        thisplanid: '0',
        thisplantoken: '0',
        starttime: new Date(),
        starttime_bool: false,
        plans: [],
        //modal start
        planname: '',
        plantimetype: 'absolute',
        plantimetypeoptions: [
          { value: 'absolute', text: this.$t('absolutetime') },
          { value: 'relative', text: this.$t('relativetime') },
        ],
        isonce: "isntonce",
        taskname: '',
        tasktime: '00:00',
        tasktimepicked: {
          HH: '00',
          mm: '00',
        },
        edittaskname: '',
        edittasktime: '00:00',
        onceedittaskname: '',
        onceedittasktime: '00:00',
        onceedittaskid: 0,
        oncedeletetaskid: 0,
        edittaskindex: 1,
        i_deletetask: 1,
        //modal.planmanager.planmodifyboard
        pmbvisibility: false,
        settingsvisibility: false,
        editplanname: '',
        editplantimetype: '',
        i_editplan: '',
        //modal end
        intervalid: 0,
        loading: true,
        iselectron: false,
        islogin: false,
        isonios: false,
        lang: 'en',
        version: '1.0.0',
        oncetask: [],
        anchor: -1,
        iffetch: 0,
      };
    },
    watch: {
      async lang (val) {
        this.storagesetlang(val);
        this.$i18n.locale = val;
        this.plantimetypeoptions = [
          { value: 'absolute', text: this.$t('absolutetime') },
          { value: 'relative', text: this.$t('relativetime') },
        ];
      },
      async plans (val) {
        this.storagesetjson('plan',val);
      },
      async oncetask (val) {
        this.storagesetjson('oncetask',val);
      }
    },
    mounted: function() {
      this.version = process.env.VUE_APP_VER;
      this.i18nsetlang();
      if(process.env.VUE_APP_LINXF == 'electron') {
        this.iselectron = true;
      }
      this.isonios = this.isiOS(navigator.userAgent);
      _this = this;
      if(AV.User.current())
      {
        this.islogin = true;
        this.storagegetdata();
        this.newsync();
        this.deleteoutdatedoncetasks();
        this.loading = false;
      } else {
        this.islogin = false;
        this.storagegetdata().then(function () {
          _this.deleteoutdatedoncetasks();
        });
        this.loading = false;
      }
      this.setintervals();
    },
    beforeDestroy: function() {
      clearInterval(this.intervalid);
    },
    methods: {
      isiPad (userAgent) {
        return (userAgent.indexOf("iPad") > -1);
      },
      isiPhone (userAgent) {
        return (userAgent.indexOf("iPhone") > -1);
      },
      isiOS (userAgent) {
        return this.isiPad(userAgent) || this.isiPhone(userAgent);
      },
      sync() {
        /*
        var oque = new AV.Query('switchable_oncetasks');
        oque.equalTo('user',AV.User.current());
        oque.ascending('time');
        var that = this;
        oque.find().then(function (oresults) {
          oresults.forEach((ot) => {
            that.oncetask.push({
                name: ot.get('name'),
                time: ot.get('time'),
                finished: ot.get('finished'),
                id: ot.id,
                plan: ot.get('plan'),
            });
          });
        }, function (error) {
          alert(error.rawMessage);
        })
        var que = new AV.Query('switchable_plans');
        que.equalTo('user',AV.User.current());
        que.ascending('createdAt');
        que.find().then(function (results) {
          results.forEach((pl) => {
            that.plans.push({
              id: pl.id,
              token: pl.get("token"),
              name: pl.get("name"),
              index: pl.get("index"),
              tasks: pl.get("tasks"),
              type: pl.get("type"),
              user: AV.User.current(),
            });
          });
          that.thisplan = that.plans[0].tasks;
          that.thisplanname = that.plans[0].name;
          that.thisplanid = that.plans[0].id;
          that.thisplantoken = that.plans[0].token;
          that.thisplanindex = that.plans[0].index;
          that.thisplantype = that.plans[0].type;
          that.sorttasks();
          that.loading = false;
        }, function (error) {
          alert(error.rawMessage);
        })*/
      },
      now() {
        return (new Date()).valueOf();
      },
      newsync() {
        if(this.islogin) {
          // plan
          var that = this;
          /*
          var plantokens = [];
          this.plans.map((item, index) => {
            plantokens.push(item.token);
          });
          this.plans.map((item, index) => {
            if (item.status < 9) {
              if (item.status == 0) {
                var newplan = new Plan();
                newplan.set('index', item.index);
                newplan.set('name', item.name);
                newplan.set('type', item.type);
                newplan.set('modified', item.modified);
                newplan.set('anchor', this.now());
                newplan.set('tasks', item.tasks);
                newplan.set('token', item.token);
                newplan.set('user', AV.User.current());
                newplan.save().then(function (np) {
                  that.plans[index].id = np.id;
                  that.plans[index].status = 9;
                }, function (error) {
                  alert(error.rawMessage);
                });
              } else if (item.status == 1) {
                var nquery = new AV.Query('switchable_plans');
                nquery.equalTo('user',AV.User.current());
                nquery.first().then(function (np) {
                  var npmodified = np.get('modified');
                  if (npmodified <= item.modified) {
                    var updp = AV.Object.createWithoutData('switchable_plans', np.id);
                    updp.set('index', item.index);
                    updp.set('name', item.name);
                    updp.set('type', item.type);
                    updp.set('anchor', that.now());
                    updp.set('tasks', item.tasks);
                    updp.save();
                    that.plans[index].status = 9;
                  }
                });
              } else if (item.status == -1) {
                var dltp = AV.Object.createWithoutData('switchable_plans', item.id);
                dltp.destroy();
              }
            }
          });
          */
          var pquery = new AV.Query('switchable_plans');
          pquery.greaterThan('anchor', this.anchor);
          pquery.find().then(function (qp) {
            var indexof = plantokens.indexOf(qp.token);
            if(indexof > -1) {
              that.plans[indexof].index = qp.get("index");
              that.plans[indexof].name = qp.get("name");
              that.plans[indexof].type = qp.get("type");
              that.plans[indexof].tasks = qp.get("tasks");
              that.plans[indexof].modified = that.anchor;
            } else {
              that.plans.push({
                id: qp.id,
                token: qp.get("token"),
                name: qp.get("name"),
                tasks: qp.get("tasks"),
                index: qp.get("index"),
                type: qp.get("type"),
                status: 9,
                modified: that.anchor,
              });
            }
          });
          this.anchor = this.now();
          this.plans = that.plans;
          //this.storagesetjson('plan', this.plans);
        } 
      },
      gologin() {
        this.$router.push('/login');
      },
      setintervals() {
        this.iffetch = 0;
        var that = this;
        that.intervalid = setInterval(() => {
          that.iffetch ++;
          if(that.iffetch == 5) {
            that.iffetch = 0;
            that.newsync();
          }
          let timeStamp = new Date();
          if(that.thisplantype == 'relative') timeStamp = new Date() - that.starttime;
          let hh = '00';
          if(that.thisplantype == 'relative') hh = (new Date(timeStamp).getHours()-8) < 10? ("0" + (new Date(timeStamp).getHours()-8)): new Date(timeStamp).getHours()-8;
          else hh = new Date(timeStamp).getHours() < 10? "0" + new Date(timeStamp).getHours(): new Date(timeStamp).getHours();
          let mm = new Date(timeStamp).getMinutes() < 10? "0" + new Date(timeStamp).getMinutes(): new Date(timeStamp).getMinutes();
          that.time = hh + ':' + mm;
          if(that.oncetask)
          {
            that.oncetask.map((item, index) => {
              if ((item.time == that.time && that.thisplantype == 'absolute') || (item.time == that.time && that.thisplantype == 'relative' && that.starttime_bool)) 
              {
                that.notifytask(item.name);
                that.oncefinish(index);
              }
            });
          }
          if(that.plans[that.i_thisplan].tasks)
          {
            that.plans[that.i_thisplan].tasks.map((item, index) => {
              if ((item.time == that.time && that.thisplantype == 'absolute') || (item.time == that.time && that.thisplantype == 'relative' && that.starttime_bool)) 
              {
                that.notifytask(item.name,item.id);
              }
            });
          }
        }, 60000);
      },
      logout() {
        var that = this;
        AV.User.logOut().then(function (user) {
          that.islogin = false;
        }, function (error) {
          alert(error.rawMessage);
        });
      },
      async storagesetlang(val) {
        await Storage.set({
          key: 'lang',
          value: val
        });
      },
      async storagesetjson(key,val) {
        await Storage.set({
          key: key,
          value: JSON.stringify(val)
        });
      },
      async i18nsetlang() {
        const keys = await Storage.keys();
        if(keys.keys.indexOf('lang') != -1) {
          const retlang = await Storage.get({ key:'lang' });
          if(retlang.value != null) _this.lang = retlang.value;
          else _this.lang = 'en', _this.storagesetlang('en');
        } else _this.lang = 'en', _this.storagesetlang('en');
        _this.$i18n.locale = _this.lang;
      },
      async storagegetdata() {
        const keys = await Storage.keys();
        if(keys.keys.indexOf('plan') != -1) {
          const splan = await Storage.get({ key:'plan' })
          _this.plans = JSON.parse(splan.value);
          _this.sorttasks();
          _this.chooseplan(_this.plans[0].name)
        } else {
          var getTime = new Date().getTime();
          if(_this.islogin) {
            var newplan = new Plan();
            var planid = "";
            newplan.set('index', 1);
            newplan.set('name', 'Plan 1');
            newplan.set('type', 'absolute');
            newplan.set('modified', _this.now());
            newplan.set('anchor', _this.now());
            newplan.set('tasks', []);
            newplan.set('token', getTime.toString());
            newplan.set('user', AV.User.current());
            newplan.save().then((np) => {
              _this.plans = [{
                id: np.id,
                token: getTime.toString(),
                name: 'Plan 1',
                index: 1,
                tasks: [],
                type: 'absolute',
                status: 9,
                modified: _this.now(),
              }];
            }, function (error) {
              alert(error.rawMessage);
            });
          } else {
            _this.plans = [{
              id: getTime,
              token: getTime.toString(),
              name: 'Plan 1',
              index: 1,
              tasks: [],
              type: 'absolute',
              status: 0,
              modified: _this.now(),
            }];
          }
          _this.chooseplan('Plan 1');
        }
        if(keys.keys.indexOf('oncetask') != -1) {
          const sotask = await Storage.get({ key:'oncetask' })
          _this.oncetask = JSON.parse(sotask.value);
          _this.sortoncetasks();
        } else {
          _this.oncetask = [];
        }
      },
      i18nchinese() {
        this.lang = 'cn';
      },
      i18nenglish() {
        this.lang = 'en';
      },
      notifytask(title,id,sound=true) {
        notify.methods.send({
          title: title,
          id: id,
          message: 'Start working on this task!',
        });
        if(sound) alarm.play();
      },
      chooseplan(planname, startbool=false) {
        this.starttime_bool = startbool;
        this.plans.map((item, index) => {
          if (item.name == planname)
          {
            this.thisplan = item.tasks;
            this.i_thisplan = index;
            this.thisplanname = item.name;
            this.thisplantype = item.type;
            this.thisplanid = item.id;
            this.thisplantoken = item.token;
            this.thisplanindex = item.index;
          }
        })
      },
      //t = task
      //modal(t) start
      tSubmit() {
        if(this.tasktime != '' && this.taskname != '')
        {
           // Push the name to submitted names
          this.loading = true;
          this.$refs['tmodal'].hide();
          if(this.isonce == 'once') {
            if(this.islogin == true) {
              /*
              var otask = new Oncetask();
              otask.set('name', this.taskname);
              otask.set('time', this.tasktime);
              otask.set('finished', false);
              otask.set('user', AV.User.current());
              otask.set('plan', this.thisplantoken)
              var that = this;
              otask.save().then(function (ot) {
                that.oncetask.push({
                  name: that.taskname,
                  time: that.tasktime,
                  finished: false,
                  id: ot.id,
                  plan: that.thisplantoken,
                });
                that.sortoncetasks();
              }, function (error) {
                alert(error.rawMessage);
              });*/
            }
            this.oncetask.push({
              name: this.taskname,
              time: this.tasktime,
              finished: false,
              id: new Date().getTime(),
              plan: this.thisplantoken,
              status: 0,
              modified: this.now(),
            });
            this.sortoncetasks();
            this.storagesetjson('oncetask',this.oncetask);
          } else {
            this.plans[this.i_thisplan].tasks.push({
              name: this.taskname,
              time: this.tasktime,
              index: this.plans[this.i_thisplan].index,
            });
            if(this.plans[this.i_thisplan].status == 9) this.plans[this.i_thisplan].status = 1;
            this.plans[this.i_thisplan].modified = this.now();
            this.thisplan = this.plans[this.i_thisplan].tasks;
            this.plans[this.i_thisplan].index ++;
            this.taskUpdater();
            this.sortthistasks();
            if(this.islogin) {
              var item = this.plans[this.i_thisplan];
              if(item.id.toString() == item.token) {
                  var newplan = new Plan();
                  var that = this;
                  newplan.set('index', item.index);
                  newplan.set('name', item.name);
                  newplan.set('type', item.type);
                  newplan.set('modified', that.now());
                  newplan.set('anchor', that.now());
                  newplan.set('tasks', item.tasks);
                  newplan.set('token', item.token);
                  newplan.set('user', AV.User.current());
                  newplan.save().then((np) => {
                    item.id = np.id;
                    item.status = 9;
                  }, function (error) {
                    alert(error.rawMessage);
                  });
              } else {
                var nquery = new AV.Query('switchable_plans');
                nquery.equalTo('user',AV.User.current());
                nquery.equalTo('token',this.plans[this.i_thisplan].token);
                var that = this;
                nquery.first().then((np) => {
                  var npmodified = np.get('modified');
                  if (npmodified <= item.modified) {
                    var updp = AV.Object.createWithoutData('switchable_plans', np.id);
                    updp.set('index', item.index);
                    updp.set('anchor', that.now());
                    updp.set('tasks', item.tasks);
                    updp.set('modified', that.now());
                    updp.save();
                    item.status = 9;
                  }
                });
              }
              this.plans[this.i_thisplan] = item;
            }
          }
          this.loading = false;
        }
        else
        {
          this.$refs['fnmodal'].show();
        }
      },
      tNew() {
        this.taskname = '';
        this.tasktime = '00:00';
        this.isonce = 'isntonce';
      },
      //modal(t) end
      //p = plan
      //modal(p) start
      pSubmit() {
        if(this.planname != ''){
            this.loading = true;
            this.$refs['pmodal'].hide();
            var getTime = new Date().getTime();
              if(this.islogin) {
                var newplan = new Plan();
                var that = this;
                var planid = "";
                newplan.set('index', 1);
                newplan.set('name', that.planname);
                newplan.set('type', that.plantimetype);
                newplan.set('modified', that.now());
                newplan.set('anchor', that.now());
                newplan.set('tasks', []);
                newplan.set('token', getTime.toString());
                newplan.set('user', AV.User.current());
                newplan.save().then((np) => {
                  this.plans.push({
                    id: np.id,
                    token: getTime.toString(),
                    name: this.planname,
                    tasks: [],
                    index: 1,
                    type: this.plantimetype,
                    status: 9,
                    modified: this.now(),
                  });
                }, function (error) {
                  alert(error.rawMessage);
                });
              } else {
                this.plans.push({
                  id: getTime,
                  token: getTime.toString(),
                  name: this.planname,
                  tasks: [],
                  index: 1,
                  type: this.plantimetype,
                  status: 0,
                  modified: this.now(),
                });
              }
            this.chooseplan(this.planname);
            this.storagesetjson('plan',this.plans);
            this.loading = false;
        }
      },
      pNew() {
        this.planname = '';
      },
      //modal(p) end
      //pe = plan edit
      //modal(pe) start
      peSubmit() {
        this.loading = true;
        if(this.editplanname != '') {
          this.plans[this.i_editplan].name = this.editplanname;
          this.plans[this.i_editplan].type = this.editplantimetype;
          if(this.plans[this.i_editplan].status == 9) this.plans[this.i_editplan].status = 1;
          this.plans[this.i_editplan].modified = this.now();
          if(this.i_thisplan == this.i_editplan) this.chooseplan(this.editplanname, this.starttime_bool);
          this.storagesetjson('plan',this.plans);
          if(this.islogin) {
            var item = this.plans[this.i_editplan];
            if(item.id.toString() == item.token) {
                var newplan = new Plan();
                var that = this;
                newplan.set('index', item.index);
                newplan.set('name', item.name);
                newplan.set('type', item.type);
                newplan.set('modified', that.now());
                newplan.set('anchor', that.now());
                newplan.set('tasks', item.tasks);
                newplan.set('token', item.token);
                newplan.set('user', AV.User.current());
                newplan.save().then(function (np) {
                  item.id = np.id;
                  item.status = 9;
                }, function (error) {
                  alert(error.rawMessage);
                });
            } else {
              var nquery = new AV.Query('switchable_plans');
              nquery.equalTo('user',AV.User.current());
              nquery.equalTo('token',this.plans[this.i_editplan].token);
              var that = this;
              nquery.first().then(function (np) {
                var npmodified = np.get('modified');
                if (npmodified <= item.modified) {
                  var updp = AV.Object.createWithoutData('switchable_plans', np.id);
                  updp.set('index', item.index);
                  updp.set('name', item.name);
                  updp.set('type', item.type);
                  updp.set('anchor', that.now());
                  updp.set('tasks', item.tasks);
                  updp.set('modified', that.now());
                  updp.save();
                  item.status = 9;
                }
              });
            }
            this.plans[this.i_editplan] = item;
          }
        }
        else
        {
          this.$refs['fnmodal'].show();
        }
        this.loading = false;
      },
      peNew() {
        this.editplanname = this.plans[this.i_editplan].name;
        this.editplantimetype = this.plans[this.i_editplan].type;
      },
      //modal(pe) end
      //e = edit task
      //model(e) start
      eSubmit() {
        this.loading = true;
        if(this.edittasktime != '' && this.edittaskname != '')
        {
          this.$refs['emodal'].hide();
           // Push the name to submitted names
          this.plans[this.i_thisplan].tasks.map((item, index) => {
            if (item.index == this.edittaskindex)
            {
              item.name = this.edittaskname;
              item.time = this.edittasktime;
            }
          });
          if(this.plans[this.i_thisplan].status == 9) this.plans[this.i_thisplan].status = 1;
          this.plans[this.i_thisplan].modified = this.now();
          this.thisplan = this.plans[this.i_thisplan].tasks;
          this.taskUpdater();
          this.sortthistasks();
          if(this.islogin) {
            var item = this.plans[this.i_thisplan];
            if(item.id.toString() == item.token) {
                var newplan = new Plan();
                var that = this;
                newplan.set('index', item.index);
                newplan.set('name', item.name);
                newplan.set('type', item.type);
                newplan.set('modified', that.now());
                newplan.set('anchor', that.now());
                newplan.set('tasks', item.tasks);
                newplan.set('token', item.token);
                newplan.set('user', AV.User.current());
                newplan.save().then(function (np) {
                  item.id = np.id;
                  item.status = 9;
                }, function (error) {
                  alert(error.rawMessage);
                });
            } else {
              var nquery = new AV.Query('switchable_plans');
              nquery.equalTo('user',AV.User.current());
              nquery.equalTo('token',this.plans[this.i_thisplan].token);
              var that = this;
              nquery.first().then(function (np) {
                var npmodified = np.get('modified');
                if (npmodified <= item.modified) {
                  var updp = AV.Object.createWithoutData('switchable_plans', np.id);
                  updp.set('index', item.index);
                  updp.set('anchor', that.now());
                  updp.set('tasks', item.tasks);
                  updp.set('modified', that.now());
                  updp.save();
                  item.status = 9;
                }
              });
            }
            this.plans[this.i_thisplan] = item;
          }
          this.loading = false;
        }
        else
        {
          this.loading = false;
          this.$refs['fnmodal'].show();
        }
      },
      eNew(ename,etime,eindex) {
        this.edittaskname = ename;
        this.edittasktime = etime;
        this.edittaskindex = eindex;
      },
      //modal(e) end
      //d = confirm deleting task
      //modal(d) start
      dSubmit() {
        this.loading = true;
        this.plans[this.i_thisplan].tasks = this.plans[this.i_thisplan].tasks.filter(dtask => {
          return dtask.index !== this.i_deletetask;
        });
        this.thisplan = this.plans[this.i_thisplan].tasks;
        this.plans[this.i_thisplan].index --;
        if(this.plans[this.i_thisplan].status == 9) this.plans[this.i_thisplan].status = 1;
        this.plans[this.i_thisplan].modified = this.now();
        this.taskUpdater();
          if(this.islogin) {
            var item = this.plans[this.i_thisplan];
            if(item.id.toString() == item.token) {
                var newplan = new Plan();
                var that = this;
                newplan.set('index', item.index);
                newplan.set('name', item.name);
                newplan.set('type', item.type);
                newplan.set('modified', that.now());
                newplan.set('anchor', that.now());
                newplan.set('tasks', item.tasks);
                newplan.set('token', item.token);
                newplan.set('user', AV.User.current());
                newplan.save().then(function (np) {
                  item.id = np.id;
                  item.status = 9;
                }, function (error) {
                  alert(error.rawMessage);
                });
            } else {
              var nquery = new AV.Query('switchable_plans');
              nquery.equalTo('user',AV.User.current());
              nquery.equalTo('token',this.plans[this.i_thisplan].token);
              var that = this;
              nquery.first().then(function (np) {
                var npmodified = np.get('modified');
                if (npmodified <= item.modified) {
                  var updp = AV.Object.createWithoutData('switchable_plans', np.id);
                  updp.set('index', item.index);
                  updp.set('name', item.name);
                  updp.set('type', item.type);
                  updp.set('anchor', that.now());
                  updp.set('tasks', item.tasks);
                  updp.set('modified', that.now());
                  updp.save();
                  item.status = 9;
                }
              });
            }
            this.plans[this.i_thisplan] = item;
          }
        this.loading = false;
      },
      dNew(dindex) {
        this.i_deletetask = dindex;
      },
      //modal(d) end
      //pd = plan delete
      //modal(pd) start
      pdSubmit() {
        this.loading = true;
        if(this.plans.length > 1){
          if(this.islogin) {
            var dltp = AV.Object.createWithoutData('switchable_plans', this.plans[this.i_editplan].id);
            dltp.destroy();
          }
          if(this.islogin) {
            /*
            var deleteplan = AV.Object.createWithoutData('switchable_plans', this.plans[this.i_editplan].id);
            var that = this;
            deleteplan.destroy().then(function (success) {
              that.plans = that.plans.filter(dplan => {
                return dplan.id !== that.editplanid;
              });
              if(that.i_editplan == that.i_thisplan) {
                that.thisplan = that.plans[0].tasks;
                that.thisplanname = that.plans[0].name;
                that.thisplanid = that.plans[0].id;
                that.thisplantoken = that.plans[0].token;
                that.thisplanindex = that.plans[0].index;
                that.i_thisplan = 0;
              } else {
                that.chooseplan(that.thisplanname, that.starttime_bool);
              }
              that.pmbvisibility = false;
            }, function (error) {
              alert(error.rawMessage);
            });*/
          }
          this.plans[this.i_editplan].status = -1;
          this.plans[this.i_editplan].modified = this.now();
          this.plans = this.plans.filter(dplan => {
            return dplan.id !== this.editplanid;
          });
          if(this.i_editplan == this.i_thisplan) {
            this.thisplan = this.plans[0].tasks;
            this.thisplanname = this.plans[0].name;
            this.thisplanid = this.plans[0].id;
            this.thisplantoken = this.plans[0].token;
            this.thisplanindex = this.plans[0].index;
            this.i_thisplan = 0;
          } else {
            this.chooseplan(this.thisplanname, this.starttime_bool);
          }
          this.pmbvisibility = false;
          this.storagesetjson('plan',this.plans);
        } else {
          this.$refs['lmnmodal'].show();
        }
        this.loading = false;
      },
      //modal(pd) end
      //r = confirm starting a relative-time plan
      //modal(r) start
      rSubmit() {
        this.starttime = new Date();
        this.starttime_bool = true;
      },
      //modal(r) end
      //g = get out of a started relative-time plan
      //modal(g) start
      gNew() {
        this.$refs['rgcmodal'].show();
      },
      gSubmit() {
        this.starttime = new Date();
        this.starttime_bool = false;
        this.$refs['rgcmodal'].hide();
      },
      //modal(g) end
      taskUpdater() {
        if(this.islogin) {
          /*
          var u_task = AV.Object.createWithoutData('switchable_plans', this.thisplanid);
          u_task.set('tasks', this.thisplan);
          this.thisplanindex ++;
          u_task.set('index', this.thisplanindex);
          u_task.save().then(function() {
            
          }, function (error) {
            alert(error.rawMessage);
          });*/
        }
        this.storagesetjson('plan',this.plans);
      },
      planModify(iid) {
        this.plans.map((item, index) => {
          if (item.id == iid)
          {
            this.pmbvisibility = true;
            this.i_editplan = index;
            this.editplanname = item.name;
            this.editplanid = item.id;
            this.editplantimetype = item.type;
          }
        })
      },
      oncefinish(index) {
        if(this.oncetask[index].status == 9) this.oncetask[index].status = 0;
        this.oncetask[index].modified = this.now();
        if(this.islogin) {
          /*
          var eo_task = AV.Object.createWithoutData('switchable_oncetasks', this.oncetask[index].id);
          eo_task.set('finished', true);
          eo_task.save().then(function() {
            
          }, function (error) {
            alert(error.rawMessage);
          });*/
        }
        this.storagesetjson('oncetask',this.oncetask);
      },
      onceeSubmit() {
        this.loading = true;
        if(this.onceedittasktime != '' && this.onceedittaskname != '')
        {
          if(this.oncetask[index].status == 9) this.oncetask[index].status = 0;
          this.oncetask[index].modified = this.now();
          this.$refs['oemodal'].hide();
          if(this.islogin) {
            /*
            var eo_task = AV.Object.createWithoutData('switchable_oncetasks', this.onceedittaskid);
            eo_task.set('name', this.onceedittaskname);
            eo_task.set('time', this.onceedittasktime);
            var that = this;
            eo_task.save().then(function() {
              that.oncetask.map((item, index) => {
                if (item.id == that.onceedittaskid)
                {
                  item.name = that.onceedittaskname;
                  item.time = that.onceedittasktime;
                }
              })
              that.sortoncetasks();
            }, function (error) {
              alert(error.rawMessage);
            });*/
          }
          this.oncetask.map((item, index) => {
            if (item.id == this.onceedittaskid)
            {
              item.name = this.onceedittaskname;
              item.time = this.onceedittasktime;
            }
          })
          this.sortoncetasks();
          this.loading = false;
        }
        else
        {
          this.loading = false;
          this.$refs['fnmodal'].show();
        }
      },
      onceeNew(ename,etime,eid) {
        this.onceedittaskname = ename;
        this.onceedittasktime = etime;
        this.onceedittaskid = eid;
      },
      oncedSubmit() {
        this.loading = true;
        if(this.islogin) {
          /*
          var eod_task = AV.Object.createWithoutData('switchable_oncetasks', this.oncedeletetaskid);
          var that = this;
          eod_task.destroy().then(function (success) {
              that.oncetask = that.oncetask.filter(ot => {
                return ot.id != that.oncedeletetaskid;
              });
          }, function (error) {
              alert(error.rawMessage);
          });*/
        }
        this.oncetask[index].status = -1;
        this.oncetask[index].modified = this.now();
        this.newsync();
        this.oncetask = this.oncetask.filter(ot => {
          return ot.id != this.oncedeletetaskid;
        });
        this.loading = false;
      },
      oncedNew(did) {
        this.oncedeletetaskid = did;
      },
      deleteoutdatedoncetasks() {
        this.oncetask.map((item,index) => {
          if(item.finished == true) {
            this.oncedeleter(item.id);
          }
        })
        this.oncetask = this.oncetask.filter(this.filterfn);
      },
      filterfn(ot) {
        return ot.finished != true;
      },
      oncedeleter(id) {
        if(this.islogin) {
          /*
          var eod_task = AV.Object.createWithoutData('switchable_oncetasks', id);
          var that = this;
          eod_task.destroy().then(function (success) {

          }, function (error) {
              alert(error.rawMessage);
          });*/
        }
        this.storagesetjson('oncetask',this.oncetask);
      },
      sortoncetasks() {
        this.oncetask.sort((a,b) => {
          return a.time > b.time;
        })
      },
      sorttasks() {
        this.plans.map((item,index) => {
          item.tasks.sort((a,b) => {
            return a.time > b.time;
          })
        })
      },
      sortthistasks() {
        this.plans[this.i_thisplan].tasks.sort((a,b) => {
          return a.time > b.time;
        })
      },
    }
  }
</script>
