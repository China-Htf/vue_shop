<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="RolesDialogVisible = true"
            >添加按钮</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', index === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item, index) in scope.row.children"
              :key="item.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="rolesRemoveById(scope.row, item.id)">
                  {{ item.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[index1 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item1, index1) in item.children"
                  :key="item1.id"
                >
                  <el-col :span="6">
                    <!-- {{item1}} -->
                    <el-tag
                      type="success"
                      closable
                      @close="rolesRemoveById(scope.row, item1.id)"
                    >
                      {{ item1.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- for循环 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item2 in item1.children"
                      :key="item2.id"
                      closable
                      @close="rolesRemoveById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色信息" prop="roleName"></el-table-column>
        <el-table-column label="权限说明" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="rolesEditShow(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="rolesRemoveUserById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加功能 -->
    <el-dialog
      title="添加角色"
      :visible.sync="RolesDialogVisible"
      width="50%"
      @close="RolesAddDialogClosed"
    >
      <!-- 内容主题区域 -->
      <el-form
        :model="rolesForm"
        :rules="rolesFormRules"
        ref="rolesFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="rolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="rolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="RolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="rolesAddUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改功能 -->
    <el-dialog
      title="修改角色"
      :visible.sync="rolesEditDialogVisible"
      width="50%"
      @close="rolesEditDialogClosed"
    >
      <!-- 内容主题区域 -->
      <el-form
        :model="rolesEditForm"
        :rules="rolesFormRules"
        ref="rolesEditFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="rolesEditForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="rolesEditForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="rolesEditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="rolesEditUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限功能 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%" @close="setRightDialogClosed"
    >
      <!-- 树型结构组件 -->
      <el-tree :data="reghtslist" :props="treeProps" show-checkbox node-key="id"
      default-expand-all :default-checked-keys="defKeys" ref="rolesTreeRef"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="rolesAllotRights"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import LoginVue from '../Login.vue';
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],
      // 控制添加用户框的显示与隐藏
      RolesDialogVisible: false,
      // 添加用户的表单数据
      rolesForm: {
        roleName: "",
        roleDesc: "",
      },
      // 添加表单的验证规则对象
      rolesFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "角色名称长度在2~10个字符之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          {
            min: 2,
            max: 10,
            message: "角色描述长度在2~10个字符之间",
            trigger: "blur",
          },
        ],
      },
      // 修改角色框的显示与隐藏
      rolesEditDialogVisible: false,
      // 查询到的角色信息对象
      rolesEditForm: {},
      // 控制分配权限框的显示与隐藏
      setRightDialogVisible: false,
      // 获取分配权限的数据
      reghtslist: [],
      // 树型组件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点Id值的数组
      defKeys: [],
      // 当前即将分配权限的角色 id
      roleId: ''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.rolelist = res.data;
      // console.log(this.rolelist);
    },
    // 监听添加对话框的关闭事件
    RolesAddDialogClosed() {
      this.$refs.rolesFormRef.resetFields();
    },
    // 点击按钮，可以添加新用户
    rolesAddUser() {
      this.$refs.rolesFormRef.validate(async (valid) => {
        if (!valid) return;
        // 可以发起请求
        const { data: res } = await this.$http.post("roles", this.rolesForm);

        if (res.meta.status !== 201) {
          this.$message.error("添加角色失败");
        }

        this.$message.success("添加角色成功");
        // 隐藏添加角色对话框
        this.RolesDialogVisible = false;
        // 重新获取角色列表数据
        this.getRolesList();
      });
    },
    // 展示编辑用户的对话框
    async rolesEditShow(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户信息失败");
      }
      this.rolesEditForm = res.data;
      this.rolesEditDialogVisible = true;
    },
    // 监听修改用户对话框的关闭事件
    rolesEditDialogClosed() {
      this.$refs.rolesEditFormRef.resetFields();
    },
    // 修改用户信息并提交
    rolesEditUserInfo() {
      this.$refs.rolesEditFormRef.validate(async (valid) => {
        if (!valid) return;
        // 发起修改角色的网络请求
        console.log(this.rolesEditForm);
        const { data: res } = await this.$http.put(
          "roles/" + this.rolesEditForm.roleId,
          {
            roleName: this.rolesEditForm.roleName,
            roleDesc: this.rolesEditForm.roleDesc,
          }
        );

        if (res.meta.status !== 200) {
          this.$message.error("更新用户信息失败");
        }
        // 关闭对话框
        this.rolesEditDialogVisible = false;
        // 刷新数据列表
        this.getRolesList();
        // 提示修改成功
        this.$message.success("更新用户信息成功");
      });
    },
    // 根据角色 id 删除角色
    async rolesRemoveUserById(id) {
      // 弹窗询问用户是否删除
      const rolesConfirm = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除， 则返回字符串 cancel
      if (rolesConfirm !== "confirm") {
        return this.$message.info("已取消删除");
      }

      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色失败");
      }

      this.$message.success("删除角色成功");
      this.getRolesList();
    },
    // 根据 id 删除对应的权限
    async rolesRemoveById(role, rightId) {
      // 弹窗提示用户是否删除
      const rolesCofirmRemove = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (rolesCofirmRemove !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        this.$message.error("删除权限失败");
      }

      role.children = res.data;
      this.$message.success("删除权限成功");
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {

      this.roleId = role.id

      const {data: res} = await this.$http.get('rights/tree')
      if(res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }

      // 把获取到的数据保存到 reghtslist
      this.reghtslist = res.data

      // 递归获取三级节点的 Id
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    // 通过递归的方式，获取角色下所有三级权限的 id，并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含 childer 属性，则是三级节点
      if(!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async rolesAllotRights() {
      const keys = [
        ...this.$refs.rolesTreeRef.getCheckedKeys(),
        ...this.$refs.rolesTreeRef.getHalfCheckedKeys()
      ]

      const idStr = keys.join(',')
      console.log(idStr)
      const {data: res} =  await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
      if(res.meta.status !== 200) {
        this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: solid 1px #eee;
}
.bdbottom {
  border-bottom: solid 1px #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
