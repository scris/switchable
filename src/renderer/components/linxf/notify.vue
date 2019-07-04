<template>

</template>

<script>
export default {
    name: 'notify',
    data() {
      return {
          
      };
    },
    methods: {
        on(obj) {
            var title = obj.title;
            var message = obj.message;
            var timeout = 5;
            if(obj.timeout != null) timeout = obj.timeout;
            /*notifier.notify({
                title: title,
                message: message,
                timeout: timeout,
            });*/
        }
    }
}
</script>
