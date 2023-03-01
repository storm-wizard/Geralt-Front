<template>
  <el-tree :data="menus" :props="defaultProps" node-key="catId" ref="menuTree" @node-click="nodeclick">
  </el-tree>
</template>

<script>
export default {
  components: {},
  props: {},
  data() {
    return {
      menus: [],
      expandedKey: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  methods: {
    getMenus() {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/product/category/list/tree'),
        method: 'get'
      }).then(({data}) => {
        console.log('Get menus successfully...', data.data)
        this.menus = data.data;
      })
    },
    nodeclick(data, node, component) {
      console.log("child category has been clicked", data, node, component)
      // send event to parent component
      this.$emit("tree-node-click", data, node, component);
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getMenus();
  },
  mounted() {
  },
  beforeCreate() {
  },
  beforeMount() {
  },
  beforeUpdate() {
  },
  updated() {
  },
  beforeDestroy() {
  },
  destroyed() {
  },
  activated() {
  }
}
</script>

<style scoped>

</style>
