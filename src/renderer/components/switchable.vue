<template>
    <div class="container">
      <loading :active.sync="loading" :can-cancel="false" :is-full-page="true" loader="bars"></loading>
      <div id="planselectorcontainer" class="linediv">
        <b-dd id="planselector" :text="thisplanname" variant="light">
          <div v-if="plans.length">
            <b-dd-item-btn v-for="plan in plans" @click="chooseplan(plan.name)">{{ plan.name }}</b-dd-item-btn>
          </div>
          <div v-else class="taskpane"> 
            <b-dd-item-btn disabled>Don't have any plans</b-dd-item-btn>
          </div>
          <b-dd-divider></b-dd-divider>
          <b-dd-item-btn v-b-modal.plannamesubmitter>Create a New Plan</b-dd-item-btn>
          <b-dd-item-btn v-b-modal.planmanager>Manage Plans</b-dd-item-btn>
        </b-dd>&nbsp;&nbsp;
        <b-btn variant="light" v-b-modal.taskcreator>Create a Task in this Plan</b-btn>
      </div>
      <div class="linediv" id="relative" v-if="thisplantype == 'relative'">
        <b-btn variant="light" v-if="!starttime_bool" v-b-modal.relativeconfirmer>Start a Relative Plan</b-btn>
        <b-btn variant="light" v-if="starttime_bool" @click="gNew">Get out of the Plan</b-btn>
      </div>
      <div id="notifies">
        <div v-if="thisplan.length">
          <div class="linediv notify" v-for="task in thisplan">
            <span class="notifyname">{{ task.name }}</span>
            <span class="notifytime">{{ task.time }}</span>
            <button class="notifyedit bfa" v-b-modal.taskedit @click="eNew(task.name,task.time,task.index)">
              <!-- bfa = button with font-awesome -->
              <i class="fa fa-edit"></i>
            </button>
            <button class="notifydelete bfa" v-b-modal.deleteconfirmer @click="dNew(task.index)">
              <i class="fa fa-ban"></i>
            </button>
          </div>
        </div>
      </div>
      <b-modal
        id="plannamesubmitter"
        ref="pmodal"
        title="Submit Plan Name"
        @ok="phandleSubmit"
        @show="pNew">
        <form ref="pform">
          <b-form-group
            label="Name"
            label-for="pname-input"
          >
            <b-form-input
              id="pname-input"
              v-model="planname"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Time Type"
            label-for="ptype-input"
            description="Absolute Time means you set 10:00 AM, and alarm goes of at 10:00 AM. Relative Time means you set 1:00 AM, and start the plan at 10:00 AM, the alarm goes of at 11:00 AM, if you set 1:20 PM (13:20), the alarm goes of at 11:20 PM (23:20)">
            <b-form-select
              id="ptype-input"
              v-model="plantimetype"
              :options="plantimetypeoptions"
            ></b-form-select>
          </b-form-group>
        </form>
      </b-modal>
      <b-modal
        id="plannameedit"
        ref="pemodal"
        title="Edit Plan"
        @ok="pehandleSubmit"
        @show="peNew">
        <form ref="peform">
          <b-form-group
            label="Name"
            label-for="pename-input"
          >
            <b-form-input
              id="pename-input"
              v-model="editplanname"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Time Type"
            label-for="petype-input"
            description="Absolute Time means you set 10:00 AM, and alarm goes of at 10:00 AM. Relative Time means you set 1:00 AM, and start the plan at 10:00 AM, the alarm goes of at 11:00 AM, if you set 1:20 PM (13:20), the alarm goes of at 11:20 PM (23:20)">
            <b-form-select
              id="ptype-input"
              v-model="editplantimetype"
              :options="plantimetypeoptions"
            ></b-form-select>
          </b-form-group>
        </form>
      </b-modal>
      <b-modal
        id="planmanager"
        ref="mmodal"
        title="Select a Plan and Make Modifications"
        ok-only>
        <b-list-group v-if="plans.length">
          <b-list-group-item button v-for="plan in plans" @click="planModify(plan.name)">{{ plan.name }}</b-list-group-item>
        </b-list-group>
        <div v-if="pmbvisibility">
          <b-btn v-b-modal.plannameedit>Edit</b-btn>&nbsp;&nbsp;
          <b-btn v-b-modal.plandeleteconfirmer>Delete</b-btn>
        </div>
      </b-modal>
      <b-modal
        id="taskcreator"
        ref="tmodal"
        title="Submit Task Information"
        @ok="thandleSubmit"
        @show="tNew">
        <form ref="tform">
          <b-form-group
            label="Name"
            label-for="tname-input"
          >
            <b-form-input
              id="tname-input"
              v-model="taskname"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Time"
            label-for="time-input"
          >
            <b-form-input
              id="time-input"
              v-model="tasktime"
              type="time"
              required
            ></b-form-input>
          </b-form-group>
        </form>
      </b-modal>
      <b-modal
        id="taskedit"
        ref="emodal"
        title="Edit Task Infomation"
        @ok="ehandleSubmit">
        <form ref="eform">
          <b-form-group
            label="Name"
            label-for="ename-input"
          >
            <b-form-input
              id="ename-input"
              v-model="edittaskname"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Time"
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
        @ok="dhandleSubmit">
        Are you sure to delete this task?
      </b-modal>
      <b-modal
        id="plandeleteconfirmer"
        @ok="pdhandleSubmit">
        Are you sure to delete this plan? All the tasks in the plan will vanish.
      </b-modal>
      <b-modal
        id="relativeconfirmer"
        @ok="rhandleSubmit">
        Are you sure to start/restart a relative plan?
      </b-modal>
      <b-modal
        id="relativegetoutconfirmer"
        @ok="ghandleSubmit"
        :visible="rgcvisibility">
        Are you sure to get out of a relative plan?
      </b-modal>
      <b-modal
        id="fillnoticer"
        ok-only
        :visible="fnvisibility">
        Make sure you filled every line, then try again.
      </b-modal>
      <b-modal
        id="leftmorenoticer"
        ok-only
        :visible="lmnvisibility">
        You must at least have one plan.
      </b-modal>
      <audio src="static/alarm.mp3" id="alarm"></audio>
    </div>
</template>

<script>
  import AV from 'leancloud-storage';
  import notify from '../components/linxf/notify';
  import Loading from 'vue-loading-overlay';
  import 'vue-loading-overlay/dist/vue-loading.css';
  var Plan = AV.Object.extend('switchable_plans');
  export default {
    name: 'switchable',
    components: {
      Loading
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
        starttime: new Date(),
        starttime_bool: false,
        plans: [],
        //modal start
        planname: '',
        plantimetype: 'absolute',
        plantimetypeoptions: [
          { value: 'absolute', text: 'Absolute Time' },
          { value: 'relative', text: 'Relative Time' },
        ],
        taskname: '',
        tasktime: '00:00',
        edittaskname: '',
        edittasktime: '00:00',
        edittaskindex: 1,
        i_deletetask: 1,
        fnvisibility: false,
        rgcvisibility: false,
        pmbvisibility: false,
        editplanname: '',
        editplantimetype: '',
        i_editplan: '',
        //modal end
        intervalid: 0,
        loading: true,
        lmnvisibility: false,
      };
    },
    mounted: function() {
      var que = new AV.Query('switchable_plans');
      que.equalTo('user',AV.User.current());
      que.ascending('createdAt');
      var that = this;
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
        that.loading = false;
        that.intervalid = setInterval(() => {
          let timeStamp = new Date();
          if(that.thisplantype == 'relative') timeStamp = new Date() - that.starttime;
          let hh = '00';
          if(that.thisplantype == 'relative') hh = (new Date(timeStamp).getHours()-8) < 10? ("0" + (new Date(timeStamp).getHours()-8)): new Date(timeStamp).getHours()-8;
          else hh = new Date(timeStamp).getHours() < 10? "0" + new Date(timeStamp).getHours(): new Date(timeStamp).getHours();
          let mm = new Date(timeStamp).getMinutes() < 10? "0" + new Date(timeStamp).getMinutes(): new Date(timeStamp).getMinutes();
          that.time = hh + ':' + mm;
          that.plans[that.i_thisplan].tasks.map((item, index) => {
              if ((item.time == that.time && that.thisplantype == 'absolute') || (item.time == that.time && that.thisplantype == 'relative' && that.starttime_bool)) 
              {
                that.notifytask(that.name);
              }
          });
        }, 60000);
      }, function (error) {
        console.error(error);
      })
    },
    beforeDestroy: function() {
      clearInterval(this.intervalid);
    },
    methods: {
      notifytask(title) {
        notify.methods.on({
          title: title,
          message: 'Start working on this task!',
          timeout: 60,
        });
        alarm.play();
      },
      chooseplan(planname) {
        this.starttime_bool = false;
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
      thandleSubmit() {
        if(this.tasktime != '' && this.taskname != '')
        {
           // Push the name to submitted names
          this.loading = true;
          this.plans[this.i_thisplan].tasks.push({
            name: this.taskname,
            time: this.tasktime,
            index: this.plans[this.i_thisplan].index,
          });
          this.thisplan = this.plans[this.i_thisplan].tasks;
          this.plans[this.i_thisplan].index ++;
          this.taskUpdater();
          this.loading = false;
        }
        else
        {
          this.fnvisibility = true;
        }
      },
      tNew() {
        this.taskname = '';
        this.tasktime = '00:00';
      },
      //modal(t) end
      //p = plan
      //modal(p) start
      phandleSubmit() {
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
          this.fnvisibility = true;
        }
      },
      pNew() {
        this.planname = '';
      },
      //modal(p) end
      //pe = plan edit
      //modal(pe) start
      pehandleSubmit() {
        if(this.editplanname != ''){
          this.loading = false;
          // Push the name to submitted names
          var plan = AV.Object.createWithoutData('switchable_plans', this.plans[this.i_editplan].id);
          plan.set('name', this.editplanname);
          plan.set('type', this.editplantimetype);
          var that = this;
          plan.save().then(function (pl) {
            that.plans[that.i_editplan].name = that.editplanname;
            that.plans[that.i_editplan].type = that.editplantimetype;
            if(that.i_thisplan == that.i_editplan) that.chooseplan(that.editplanname);
            that.loading = false;
          }, function (error) {
            console.error(error);
            that.loading = false;
          });
        }
        else
        {
          this.fnvisibility = true;
        }
      },
      peNew() {
        this.editplanname = this.plans[this.i_editplan].name;
        this.editplantimetype = this.plans[this.i_editplan].type;
      },
      //modal(pe) end
      //e = edit task
      //model(e) start
      ehandleSubmit() {
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
          this.loading = false;
        }
        else
        {
          this.fnvisibility = true;
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
      dhandleSubmit() {
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
      pdhandleSubmit() {
          this.loading = true;
          var deleteplan = AV.Object.createWithoutData('switchable_plans', this.plans[this.i_editplan].id);
          if(this.plans.length > 1){
            var that = this;
            deleteplan.destroy().then(function (success) {
              that.plans = that.plans.filter(dplan => {
                return dplan.name !== that.editplanname;
              });
              if(that.i_editplan == that.i_thisplan) {
                that.thisplan = that.plans[0].tasks;
                that.thisplanname = that.plans[0].name;
                that.thisplanid = that.plans[0].id;
                that.thisplanindex = that.plans[0].index;
                that.i_thisplan = 0;
              }
              that.loading = false;
            }, function (error) {
              console.error(error);
              that.loading = false;
            });
          } else {
            this.lmnvisibility = true;
            this.loading = false;
          }
      },
      //modal(pd) end
      //r = confirm starting a relative-time plan
      //modal(r) start
      rhandleSubmit() {
        this.starttime = new Date();
        this.starttime_bool = true;
      },
      //modal(r) end
      //g = get out of a started relative-time plan
      //modal(g) start
      gNew() {
        this.rgcvisibility = true;
      },
      ghandleSubmit() {
        this.starttime = new Date();
        this.starttime_bool = false;
        this.rgcvisibility = false;
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
      planModify(name) {
        this.plans.map((item, index) => {
          if (item.name == name)
          {
            this.pmbvisibility = true;
            this.i_editplan = index;
            this.editplanname = item.name;
            this.editplantimetype = item.type;
          }
        })
      },
    },
  }
</script>
