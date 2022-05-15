<template>
  <div class="channel-edit">
    <van-cell :border="false">
      <div slot="title" class="title-text">我的频道</div>
      <van-button
        type="danger"
        plain
        round
        size="mini"
        class="edit-btn"
        @click="isEdit = !isEdit"
        >{{ isEdit ? "完成" : "编辑" }}</van-button
      >
    </van-cell>
    <van-grid class="my-grid" :gutter="10">
      <van-grid-item
        class="grid-item"
        v-for="(channel, index) in myChannels"
        :key="index"
        :text="channel.name"
        @click="onMyChannelClick(channel, index)"
      >
        <van-icon
          v-show="isEdit && !fixedChannnels.includes(channel.id)"
          slot="icon"
          name="clear"
        ></van-icon>
        <span class="text" slot="text" :class="{ active: index === active }">{{
          channel.name
        }}</span>
      </van-grid-item>
    </van-grid>
    <!-- 频道推荐 -->
    <van-cell :border="false">
      <div slot="title" class="title-text">频道推荐</div>
    </van-cell>
    <van-grid class="recommend-grid" :gutter="10">
      <van-grid-item
        class="grid-item"
        v-for="(channel, index) in recommendChannels"
        :key="index"
        icon="plus"
        :text="channel.name"
        @click="onAddChannel(channel)"
      />
    </van-grid>
    <!-- /频道推荐 -->
  </div>
</template>

<script>
import {
  getAllChannels,
  addUserChannel,
  deleteUserChannel,
} from "@/api/channel";
import { mapState } from "vuex";
import { setItem } from "@/utils/storage";
export default {
  name: "ChannelEdit",
  props: {
    myChannels: {
      type: Array,
      required: true,
    },
    active: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      allChannels: [], // 所有频道
      isEdit: false, // 编辑删除标识的显示
      fixedChannnels: [0], // 固定频道，不允许删除
    };
  },
  computed: {
    ...mapState(["user"]),
    // 方法一
    /*  recommendChannels() {
      const channels = [];
      this.allChannels.forEach((channel) => {
        // find 遍历数组，找到满足条件的元素项
        const ret = this.myChannels.find((myChannel) => {
          return myChannel.id === channel.id;
        });
        // 如果我的频道中不包括该频道，则收集到推荐频道中
        if (!ret) {
          channels.push(channel);
        }
      });

      return channels;
    }, */
    // 方法二
    recommendChannels() {
      // 计算属性会观测内部依赖数据的变化
      // 如果依赖的数据发生变化，则计算属性会重新执行
      // 数组 filter 方法：把符合条件的元素存储到新数组中并返回
      return this.allChannels.filter((channel) => {
        return !this.myChannels.find((myChannel) => {
          return myChannel.id === channel.id;
        });
      });
    },
  },
  created() {
    this.loadAllChannels();
  },
  methods: {
    async loadAllChannels() {
      try {
        const { data } = await getAllChannels();
        this.allChannels = data.data.channels;
      } catch (err) {
        this.$toast("数据获取失败");
      }
    },
    async onAddChannel(channel) {
      this.myChannels.push(channel);

      // 数据持久化处理
      if (this.user) {
        try {
          // 已登录，把数据请求接口放到线上
          await addUserChannel({
            id: channel.id, // 频道ID
            seq: this.myChannels.length, // 序号
          });
        } catch (err) {
          this.$toast("保存失败，请稍后重试");
        }
      } else {
        // 未登录，把数据存储到本地
        setItem("TOUTIAO_CHANNELS", this.myChannels);
      }
    },
    onMyChannelClick(channel, index) {
      if (this.isEdit) {
        // 1.如果是固定频道，则不删除
        if (this.fixedChannnels.includes(channel.id)) {
          return this.$toast("该频道不能删除");
        }

        // 2.删除频道项
        this.myChannels.splice(index, 1);

        // 3.如果删除激活频道之前的频道，则更新激活的频道项
        if (index <= this.active) {
          // 让激活频道的索引 - 1
          this.$emit("updata-active", this.active - 1, true);
        }

        // 4.处理持久化
        this.deleteChannel(channel);
      } else {
        // 非编辑状态，执行切换频道
        this.$emit("updata-active", index, false);
      }
    },
    async deleteChannel(channel) {
      try {
        if (this.user) {
          // 已登录，则将数据更新到线上
          await deleteUserChannel(channel.id);
        } else {
          // 未登录，将数据更新到本地
          setItem("TOUTIAO_CHANNELS", this.myChannels);
        }
      } catch (err) {
        this.$toast("操作失败，请稍后重试");
      }
    },
  },
};
</script>

<style scoped lang="less">
.channel-edit {
  padding: 85px 0;
  .title-text {
    font-size: 32px;
    color: #333;
  }
  .edit-btn {
    width: 104px;
    height: 48px;
    font-size: 26px;
    color: #f85959;
    border: 1px solid #f85959;
  }
  /deep/ .grid-item {
    width: 160px;
    height: 86px;
    .van-grid-item__content {
      background-color: #f4f5f6;
      .van-grid-item__text,
      .text {
        font-size: 28px;
        color: #222;
        margin-top: 0;
      }
      .active {
        color: red;
      }
      .van-grid-item__icon-wrapper {
        position: unset;
      }
    }
  }

  /deep/ .my-grid {
    .grid-item {
      .van-icon-clear {
        position: absolute;
        right: -10px;
        top: -10px;
        font-size: 30px;
        color: #cacaca;
        z-index: 2;
      }
    }
  }

  /deep/ .recommend-grid {
    .grid-item {
      .van-grid-item__content {
        white-space: nowrap;
        flex-direction: row;
        .van-icon-plus {
          font-size: 28px;
          margin-right: 6px;
        }
      }
    }
  }
}
</style>
