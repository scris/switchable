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
            <div class="notifypane" v-if="task.plan == thisplanid"><span class="notifyname" v-bind:class="{ finishedoncetask: task.finished }">{{ task.name }}</span>&nbsp;<small class="text-muted once" v-if="!task.finished">{{ $t('tonce') }}</small><small class="text-muted once" v-if="task.finished">{{ $t('finishedoncetask') }}</small></div>
            <div class="notifypane" v-if="task.plan == thisplanid">
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
          <b-form-group
            :label="$t('pname')"
            label-for="pname-input"
          >
            <b-form-input
              id="pname-input"
              v-model="planname"
              :placeholder="$t('pplanname')"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('ptimetype')"
            label-for="ptype-input">
            <b-form-select
              id="ptype-input"
              v-model="plantimetype"
              :options="plantimetypeoptions"
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
                  <b-form-group :label="$t('pname')" label-for="pename-input">
                    <b-form-input id="pename-input" v-model="editplanname" required></b-form-input>
                  </b-form-group>
                  <b-form-group :label="$t('ptimetype')" label-for="petype-input">
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
          <b-form-group
            :label="$t('tname')"
            label-for="tname-input"
          >
            <b-form-input
              id="tname-input"
              v-model="taskname"
              :placeholder="$t('ttaskname')"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('ttime')"
            label-for="time-input"
          >
            <b-form-input
              id="time-input"
              v-model="tasktime"
              type="time"
              required
            ></b-form-input>
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
          <b-form-group
            :label="$t('tname')"
            label-for="ename-input"
          >
            <b-form-input
              id="ename-input"
              v-model="edittaskname"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('ttime')"
            label-for="time-input"
          >
            <b-form-input
              id="time-input"
              v-model="edittasktime"
              type="time"
              required
            ></b-form-input>
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
          <b-form-group
            :label="$t('tname')"
            label-for="oename-input"
          >
            <b-form-input
              id="oename-input"
              v-model="onceedittaskname"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('ttime')"
            label-for="oetime-input"
          >
            <b-form-input
              id="oetime-input"
              v-model="onceedittasktime"
              type="time"
              required
            ></b-form-input>
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
        :ok-title="$t('submit')">  
        {{ $t('loctext') }}
      </b-modal>
      <b-modal
        id="settingspanel"
        ok-only
        :title="$t('stitle')"
        ref="smodal">
        <b-row>
          <b-col sm="2" class="settingsleftbar"><small>{{ $t('saccount') }}</small></b-col>
          <b-col><b-btn v-b-modal.loggingoutconfirmer>{{ $t('slogout') }}</b-btn></b-col>
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
              {{ $t('sauthor') }} <a class="text-muted-icon" href="https://github.com/scris" target="_blank"><i class="fab fa-github"></i></a>&nbsp;<a class="text-muted-icon" href="mailto:tianze@scris.top" target="_blank"><i class="fa fa-envelope"></i></a> {{ $t('sothercontributor') }} <br>
              {{ $t('scontribute') }} <a class="text-muted-icon" href="https://github.com/scris/switchable/" target="_blank"><i class="fab fa-github"></i></a>
            </small>
          </b-col>
        </b-row>
        <div slot="modal-footer">
          <div class="settingsfooter">
            <b-button varient="primary" @click="$refs['smodal'].hide()">{{ $t('close') }}</b-button>
          </div>
        </div>
      </b-modal>
    </div>
</template>

<script>
  import AV from 'leancloud-storage';
  import notify from '@/components/linxf/notify';
  import Loading from 'vue-loading-overlay';
  import 'vue-loading-overlay/dist/vue-loading.css';
  import { Plugins } from '@capacitor/core';
  const { Storage } = Plugins;
  //import VueTimepicker from 'vue2-timepicker'
  var Plan = AV.Object.extend('switchable_plans');
  var Oncetask = AV.Object.extend('switchable_oncetasks');
  var alarm = new Audio();
  alarm.src = require("@/assets/alarm.mp3");
  export default {
    name: 'switchable',
    components: {
      Loading,
      //VueTimepicker,
    },
    data() {
      return {
        packageno: '0.2.0',
        buildno: '4',
        time: '00:00',
        thisplan: [],
        i_thisplan: 0,
        thisplanname: '',
        thisplantype: 'absolute',
        thisplanindex: 1,
        thisplanid: '0',
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
        lang: 'en',
        version: '1.0.0',
        oncetask: [],
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
      }
    },
    mounted: function() {
      this.version = process.env.VUE_APP_VER;
      this.i18nsetlang();
      if(process.env.VUE_APP_LINXF == 'electron') {
        this.iselectron = true;
      }
      if(AV.User.current())
      {
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
          console.error(error);
        })
        var que = new AV.Query('switchable_plans');
        que.equalTo('user',AV.User.current());
        que.ascending('createdAt');
        que.find().then(function (results) {
          results.forEach((pl) => {
            that.plans.push({
              id: pl.id,
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
          that.thisplanindex = that.plans[0].index;
          that.thisplantype = that.plans[0].type;
          that.sorttasks();
          that.loading = false;
          that.intervalid = setInterval(() => {
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
          that.deleteoutdatedoncetasks();
        }, function (error) {
          console.error(error);
        })
      } else {
        this.$router.push('/login');
      }
    },
    beforeDestroy: function() {
      clearInterval(this.intervalid);
    },
    methods: {
      logout() {
        var that = this;
        AV.User.logOut().then(function (user) {
          that.$router.push('/login');
        }, function (error) {
          console.error(error);
        });
      },
      async storagesetlang(val) {
        await Storage.set({
          key: 'lang',
          value: val
        });
      },
      async i18nsetlang() {
        const keys = await Storage.keys();
        if(keys.keys.indexOf('lang') != -1) {
          const retlang = await Storage.get({ key:'lang' });
          if(retlang.value != null) this.lang = retlang.value;
          else this.lang = 'en', this.storagesetlang('en');
        } else this.lang = 'en', this.storagesetlang('en');
        this.$i18n.locale = this.lang;
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
          if(this.isonce == 'once') {
            var otask = new Oncetask();
            otask.set('name', this.taskname);
            otask.set('time', this.tasktime);
            otask.set('finished', false);
            otask.set('user', AV.User.current());
            otask.set('plan', this.thisplanid)
            var that = this;
            otask.save().then(function (ot) {
              that.oncetask.push({
                name: that.taskname,
                time: that.tasktime,
                finished: false,
                id: ot.id,
                plan: that.thisplanid,
              });
              that.sorttonceasks();
            }, function (error) {
              console.error(error);
            });
          } else {
            this.plans[this.i_thisplan].tasks.push({
              name: this.taskname,
              time: this.tasktime,
              index: this.plans[this.i_thisplan].index,
            });
            this.thisplan = this.plans[this.i_thisplan].tasks;
            this.plans[this.i_thisplan].index ++;
            this.taskUpdater();
            this.sortthistasks();
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
          // Push the name to submitted names
          var plan = new Plan();
          plan.set('name', this.planname);
          plan.set('tasks', []);
          plan.set('index', 1);
          plan.set('type', this.plantimetype);
          plan.set('user', AV.User.current());
          var that = this;
          plan.save().then(function (pl) {
            that.plans.push({
              id: pl.id,
              name: that.planname,
              tasks: [],
              index: 1,
              type: that.plantimetype,
            });
            that.chooseplan(that.planname);
            that.loading = false;
          }, function (error) {
            console.error(error);
            that.loading = false;
          });
        }
        else
        {
          this.$refs['fnmodal'].show();
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
        if(this.editplanname != ''){
          var plan = AV.Object.createWithoutData('switchable_plans', this.plans[this.i_editplan].id);
          plan.set('name', this.editplanname);
          plan.set('type', this.editplantimetype);
          var that = this;
          plan.save().then(function (pl) {
            that.plans[that.i_editplan].name = that.editplanname;
            that.plans[that.i_editplan].type = that.editplantimetype;
            if(that.i_thisplan == that.i_editplan) that.chooseplan(that.editplanname, that.starttime_bool);
          }, function (error) {
            console.error(error);
          });
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
           // Push the name to submitted names
          this.plans[this.i_thisplan].tasks.map((item, index) => {
            if (item.index == this.edittaskindex)
            {
              item.name = this.edittaskname;
              item.time = this.edittasktime;
            }
          });
          this.thisplan = this.plans[this.i_thisplan].tasks;
          this.taskUpdater();
          this.sortthistasks();
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
        this.taskUpdater();
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
        var deleteplan = AV.Object.createWithoutData('switchable_plans', this.plans[this.i_editplan].id);
        if(this.plans.length > 1){
          var that = this;
          deleteplan.destroy().then(function (success) {
            that.plans = that.plans.filter(dplan => {
              return dplan.id !== that.editplanid;
            });
            if(that.i_editplan == that.i_thisplan) {
              that.thisplan = that.plans[0].tasks;
              that.thisplanname = that.plans[0].name;
              that.thisplanid = that.plans[0].id;
              that.thisplanindex = that.plans[0].index;
              that.i_thisplan = 0;
            } else {
              that.chooseplan(that.thisplanname, that.starttime_bool);
            }
            that.pmbvisibility = false;
          }, function (error) {
            console.error(error);
          });
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
        var u_task = AV.Object.createWithoutData('switchable_plans', this.thisplanid);
        u_task.set('tasks', this.thisplan);
        this.thisplanindex ++;
        u_task.set('index', this.thisplanindex);
        u_task.save().then(function() {
          
        }, function (error) {
          console.error(error);
        });
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
        this.oncetask[index].finished = true;
        var eo_task = AV.Object.createWithoutData('switchable_oncetasks', this.oncetask[index].id);
        eo_task.set('finished', true);
        eo_task.save().then(function() {
          
        }, function (error) {
          console.error(error);
        });
      },
      onceeSubmit() {
        this.loading = true;
        if(this.onceedittasktime != '' && this.onceedittaskname != '')
        {
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
            console.error(error);
          });
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
        var eod_task = AV.Object.createWithoutData('switchable_oncetasks', this.oncedeletetaskid);
        var that = this;
        eod_task.destroy().then(function (success) {
            that.oncetask = that.oncetask.filter(ot => {
              return ot.id != that.oncedeletetaskid;
            });
        }, function (error) {
            console.error(error);
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
        this.oncetask = this.oncetask.filter(ot => {
          return ot.finished != true;
        })
      },
      oncedeleter(id) {
        var eod_task = AV.Object.createWithoutData('switchable_oncetasks', id);
        var that = this;
        eod_task.destroy().then(function (success) {

        }, function (error) {
            console.error(error);
        });
      },
      sorttonceasks() {
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
      }
    },
  }
</script>
