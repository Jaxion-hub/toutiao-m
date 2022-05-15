<template>
  <div class="search-suggestion">
    <van-cell
      icon="search"
      v-for="(suggestion, index) in suggestions"
      :key="index"
      @click="$emit('search', suggestion)"
    >
      <div slot="title" v-html="highlight(suggestion)"></div>
    </van-cell>
  </div>
</template>

<script>
import { getSearchSuggestions } from "@/api/search";
import { debounce } from "lodash";

export default {
  name: "SearchSuggestion",
  props: {
    searchText: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      suggestions: [], // 联想建议
      htmlStr: 'Hello <span style="color: red">World</span>',
    };
  },
  watch: {
    searchText: {
      // 当 searchText 发生改变的时候就会调用 handler 函数
      // 注意：handler 函数名称是固定的
      // debounced（防抖动）函数
      handler: debounce(function (value) {
        this.loadSearchSuggestions(value);
      }, 300),
      /*  handler(value) {
        this.loadSearchSuggestions(value);
      }, */
      // 该回调将会在侦听开始之后被立即调用
      immediate: true,
    },
  },
  methods: {
    async loadSearchSuggestions(q) {
      try {
        const { data } = await getSearchSuggestions(q);
        this.suggestions = data.data.options;
      } catch (err) {
        this.$toast("数据获取失败，请稍后重试");
      }
    },
    highlight(text) {
      const highlightStr = `<span class="active">${this.searchText}</span>`;
      const reg = new RegExp(this.searchText, "gi");
      if (text) {
        return text.replace(reg, highlightStr);
      }
    },
  },
};
</script>

<style scoped lang="less">
.search-suggestion {
  /deep/ span.active {
    color: #3296fa;
  }
}
</style>
