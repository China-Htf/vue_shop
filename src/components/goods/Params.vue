<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert
        title="注意：只允许第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="params_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectParamsKeys"
            :options="paramsList"
            :props="paramsProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeParamsName" @tab-click="handleParamsClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnParamsDisabled"
            @click="paramsAddDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- <el-button type="primary" class="el-icon-edit" size="mini"
                  >编辑</el-button
                > -->
                <el-button
                  type="danger"
                  class="el-icon-delete"
                  size="mini"
                  @click="removeById(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnParamsDisabled"
            @click="paramsAddDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="属性名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- <el-button type="primary" class="el-icon-edit" size="mini"
                  >编辑</el-button
                > -->
                <el-button
                  type="danger"
                  class="el-icon-delete"
                  size="mini"
                  @click="removeById(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + textTitle"
      :visible.sync="paramsAddDialogVisible"
      width="50%"
      @close="addParamsDialogRules"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addParamsFormRef"
        label-width="100px"
      >
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="paramsAddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFormParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类参数的数据列表
      paramsList: [],
      // 级联选择框的配置对象
      paramsProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 级联选择框双向绑定到的数组
      selectParamsKeys: [],
      // 被激活的页签名称
      activeParamsName: "many",
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      paramsAddDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: "",
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      // 添加控制按钮与文本框的显示与隐藏
      inputVisible: false,
      // 文本框中输入的内容
      inputValue: ''
    };
  },
  created() {
    this.getParamsList();
  },
  methods: {
    // 获取所有的商品分类列表
    async getParamsList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类列表失败");
      }
      this.paramsList = res.data;
      console.log(this.paramsList);
    },
    // 级联选择框选中项变化，会触发这个函数
    async handleChange() {
      this.getParamsData();
    },
    // tab 页签点击事件的处理函数
    handleParamsClick() {
      this.getParamsData();
      console.log(this.activeParamsName);
    },
    // 获取参数的列表数据
    async getParamsData() {
      if (this.selectParamsKeys.length !== 3) {
        this.selectParamsKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      console.log(this.selectParamsKeys);
      // 根据所选分类的 Id 和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.paramsId}/attributes`,
        {
          params: { sel: this.activeParamsName },
        }
      );

      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      });

      console.log(res.data);
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败!");
      }
      if (this.activeParamsName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    // 监听对话框的关闭事件
    addParamsDialogRules() {
      this.$refs.addParamsFormRef.resetFields();
    },
    // 点击按钮，添加参数
    addFormParams() {
      this.$refs.addParamsFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.paramsId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeParamsName,
          }
        );
        console.log(res.data);
        if (res.meta.status !== 201) {
          this.$message.error("添加参数失败！");
        }
        this.$message.success("添加参数成功！");
        this.paramsAddDialogVisible = false;
        this.getParamsData();
      });
    },
    // 删除指定参数
    async removeById(id) {
      const { data: res } = await this.$http.delete(
        `categories/${this.paramsId}/attributes/${id}`
      );
      if (res.meta.status !== 200) {
        this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      this.getParamsData();
    },
    // 文本框失去焦点，或者按下 Enter 触发
    async handleInputConfirm(row) {
      if(row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有 return 则证明输入的内容需要做后续的处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 发起请求，保存这次操作
      this.saveAttrVals(row)
    },
    // 对 attr_vals 的操作保存到数据库
    async saveAttrVals(row) {
      // 发起请求，保存这次操作
      const {data: res} = await this.$http.put(`categories/${this.paramsId}/attributes/${row.attr_id}`,
      {attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ')})
      if(res.meta.status !== 200) {
        return this.$message.error('修改参数失败！')
      }
      this.$message.success('修改参数成功！')
    },
    // 点击按钮，显示文本框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 当页面重新被渲染以后，才会指定回调函数中的代码
      this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 删除对应的参数可选项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回 true，否则返回 false
    isBtnParamsDisabled() {
      if (this.selectParamsKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级Id
    paramsId() {
      if (this.selectParamsKeys.length === 3) {
        return this.selectParamsKeys[2];
      }
      return null;
    },
    // 动态计算标题的文本
    textTitle() {
      if (this.activeParamsName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
  },
};
</script>

<style lang="less" scoped>
.params_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
