<template>
  <div>
    <el-switch
      v-model="draggable"
      active-text="Enable Drag"
      inactive-text="Disable Drag">
    </el-switch>
    <el-button @click="batchSave" v-if="draggable">
      Save
    </el-button>
    <el-button type="danger" @click="batchDelete">Delete</el-button>
    <el-tree :data="menus" :props="defaultProps" :expand-on-click-node="false" show-checkbox node-key="catId"
             :default-expanded-keys="expandedKey" :draggable="draggable" :allow-drop="allowDrop"
             @node-drop="handleDrop" ref="menuTree">
     <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <el-button
            v-if="node.level <= 2"
            type="text"
            size="mini"
            @click="() => append(data)">
            Append
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="() => edit(data)">
            Update
          </el-button>
          <el-button
            v-if="node.childNodes.length == 0"
            type="text"
            size="mini"
            @click="() => remove(node, data)">
            Delete
          </el-button>
        </span>
      </span>
    </el-tree>

    <el-dialog
      v-bind:title="title"
      :visible.sync="dialogVisible"
      width="30%"
      :close-on-click-modal="false">
      <el-form :model="category">
        <el-form-item label="category name">
          <el-input v-model="category.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="category icon">
          <el-input v-model="category.icon" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="category unit">
          <el-input v-model="category.productUnit" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">Cancel</el-button>
    <el-button type="primary" @click="submitData">Confirm</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  components: {},
  props: {},
  data() {
    return {
      pCid: [],
      draggable: false,
      updateNodes: [],
      maxLevel: 0,
      title: "",
      dialogType: "", // edit, add
      category: {
        name: "",
        parentCid: 0,
        catLevel: 0,
        showStatus: 0,
        sort: 0,
        catId: null,
        productUnit: "",
        icon: "",
      },
      dialogVisible: false,
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
    append(data) {
      console.log("append, ", data)

      this.dialogType = "add"
      this.title = "add category"
      this.dialogVisible = true
      this.category.parentCid = data.catId
      this.category.catLevel = data.catLevel * 1 + 1

      this.category.catId = null
      this.category.icon = ""
      this.category.productUnit = ""
      this.category.name = ""
      this.category.sort = 0
      this.category.showStatus = 1
    },
    edit(data) {
      console.log("update")

      this.title = "edit category"
      this.dialogType = "edit"
      this.dialogVisible = true

      // send request to get latest data
      this.$http({
        url: this.$http.adornUrl(`/product/category/info/${data.catId}`),
        method: 'get',
        param: this.$http.adornParams({})
      }).then(({data}) => {
        console.log("Get successfully", data)
        this.category.name = data.data.name
        this.category.catId = data.data.catId
        this.category.icon = data.data.icon
        this.category.productUnit = data.data.productUnit
      })
    },
    remove(node, data) {
      this.$confirm('Please would you like to confirm the deletion ?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        var ids = [data.catId]
        this.$http({
          url: this.$http.adornUrl('/product/category/delete'),
          method: 'post',
          data: this.$http.adornData(ids, false)
        }).then(({data}) => {
          this.$message({
            message: 'Delete menu successfully',
            type: 'success'
          });
          // refresh new menus and then set default expand menus
          this.getMenus();
          this.expandedKey = [node.parent.data.catId]
        });
        console.log("remove", node, data)
      }).catch(() => {
      })
    },
    submitData() {
      if (this.dialogType == "add") {
        this.addCategory();
      } else if (this.dialogType == "edit") {
        this.editCategory();
      }
    },
    addCategory() {
      console.log("Submit category data", this.category)
      this.$http({
        url: this.$http.adornUrl('/product/category/save'),
        method: 'post',
        data: this.$http.adornData(this.category, false)
      }).then(({data}) => {
        this.$message({
          message: 'Add menu successfully',
          type: 'success'
        });
        this.dialogVisible = false
        // refresh new menus and then set default expand menus
        this.getMenus();
        this.expandedKey = [this.category.parentCid]
      });
    },
    editCategory() {
      let {catId, name, icon, productUnit} = this.category
      let paramData = {
        catId: catId,
        name: name,
        icon: icon,
        productUnit: productUnit,
      }
      this.$http({
        url: this.$http.adornUrl('/product/category/update'),
        method: 'post',
        data: this.$http.adornData(paramData, false)
      }).then(({data}) => {
        this.$message({
          message: 'Edit menu successfully',
          type: 'success'
        });
        this.dialogVisible = false
        // refresh new menus and then set default expand menus
        this.getMenus();
        this.expandedKey = [this.category.parentCid]
      });
    },
    batchSave() {
      this.$http({
        url: this.$http.adornUrl("/product/category/update/batch"),
        method: "post",
        data: this.$http.adornData(this.updateNodes, false)
      }).then(({data}) => {
        this.$message({
          message: "Edit Menus' order successfully",
          type: "success"
        });
        this.getMenus();
        this.expandedKey = this.pCid;
        this.updateNodes = [];
        this.maxLevel = 0;
      });
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log("handleDrop: ", draggingNode, dropNode, dropType);
      let pCid = 0;
      let siblings = null;
      if (dropType == "before" || dropType == "after") {
        pCid =
          dropNode.parent.data.catId == undefined
            ? 0
            : dropNode.parent.data.catId;
        siblings = dropNode.parent.childNodes;
      } else {
        pCid = dropNode.data.catId;
        siblings = dropNode.childNodes;
      }
      this.pCid.push(pCid);

      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].data.catId == draggingNode.data.catId) {
          let catLevel = draggingNode.level;
          if (siblings[i].level != draggingNode.level) {
            catLevel = siblings[i].level;
            this.updateChildNodeLevel(siblings[i]);
          }
          this.updateNodes.push({
            catId: siblings[i].data.catId,
            sort: i,
            parentCid: pCid,
            catLevel: catLevel
          });
        } else {
          this.updateNodes.push({catId: siblings[i].data.catId, sort: i});
        }
      }

      console.log("updateNodes", this.updateNodes);
    },
    updateChildNodeLevel(node) {
      if (node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          var cNode = node.childNodes[i].data;
          this.updateNodes.push({
            catId: cNode.catId,
            catLevel: node.childNodes[i].level
          });
          this.updateChildNodeLevel(node.childNodes[i]);
        }
      }
    },
    allowDrop(draggingNode, dropNode, type) {
      console.log("allowDrop:", draggingNode, dropNode, type);

      this.countNodeLevel(draggingNode);

      let depth = Math.abs(this.maxLevel - draggingNode.level) + 1;
      console.log("Depth：", depth);

      //   this.maxLevel
      if (type == "inner") {
        // console.log(
        //   `this.maxLevel：${this.maxLevel}；draggingNode.data.catLevel：${draggingNode.data.catLevel}；dropNode.level：${dropNode.level}`
        // );
        return depth + dropNode.level <= 3;
      } else {
        return depth + dropNode.parent.level <= 3;
      }
    },
    countNodeLevel(node) {
      if (node.childNodes != null && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (node.childNodes[i].level > this.maxLevel) {
            this.maxLevel = node.childNodes[i].level;
          }
          this.countNodeLevel(node.childNodes[i]);
        }
      }
    },
    batchDelete() {
      let catIds = [];
      let checkedNodes = this.$refs.menuTree.getCheckedNodes();
      console.log("selected elements", checkedNodes);
      for (let i = 0; i < checkedNodes.length; i++) {
        catIds.push(checkedNodes[i].catId);
      }
      this.$confirm(`Whether bath delete【${catIds}】 menus?`, "Warning", {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "warning"
      })
        .then(() => {
          this.$http({
            url: this.$http.adornUrl("/product/category/delete"),
            method: "post",
            data: this.$http.adornData(catIds, false)
          }).then(({data}) => {
            this.$message({
              message: "Batch delete menus successfully",
              type: "success"
            });
            this.getMenus();
          });
        })
        .catch(() => {
        });
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
