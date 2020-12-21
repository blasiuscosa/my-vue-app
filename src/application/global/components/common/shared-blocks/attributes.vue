<template>
  <tbody>
    <template v-for="(itemData, index) in itemsData" v-if="Array.isArray(itemsData)">
      <tr
        v-if="
          ($helpers.isSet(itemData, 'product') && itemData.product.is_dummy_code) ||
            (itemData.is_dummy_code && itemData.dummy !== null)
        "
      >
        <td align="left" :data-th="tableTh[1]">
          {{
            $helpers.isSet(itemData, 'product')
              ? $helpers.getValue(itemData, 'product.sku')
              : $helpers.getValue(itemData, 'sku')
          }}
        </td>
        <td align="left" :data-th="tableTh[2]">
          {{
            $helpers.isSet(itemData, 'product')
              ? $helpers.getValue(itemData, 'product.name')
              : $helpers.getValue(itemData, 'name')
          }}
          <span v-if="itemData.foc_qty > 0" class="text-grey-5"> (FOC) </span>
        </td>
        <td v-if="selectedInstantQty > 0" align="center" :data-th="tableTh[4]">
          {{
            getAttributeTotalSelectedQuantityCount(
              isEvoucherRedemption ? itemData.master_product_id : itemData.product_id,
              isEvoucherRedemption ? itemData.master_kitting_id : itemData.kitting_id,
              itemData.dummy.id,
              itemData.quantity === 0
            )
          }}
          /
          {{
            productID
              ? selectedInstantQty
              : selectedInstantQty * (itemData.quantity !== 0 ? itemData.quantity : itemData.foc_qty)
          }}
        </td>
        <td v-else align="center" :data-th="tableTh[4]">
          -
        </td>
        <td v-if="selectedInstantQty > 0" align="center" width="30%">
          <q-btn
            v-if="itemData.dummy !== null"
            :disable="itemData.dummy === null && itemData.dummy.dummy_products.length < 1"
            :color="
              getAttributeTotalSelectedQuantityCount(
                isEvoucherRedemption ? itemData.master_product_id : itemData.product_id,
                isEvoucherRedemption ? itemData.master_kitting_id : itemData.kitting_id,
                itemData.dummy.id,
                itemData.quantity === 0
              ) ===
              (productID !== null
                ? selectedInstantQty
                : selectedInstantQty * (itemData.quantity !== 0 ? itemData.quantity : itemData.foc_qty))
                ? 'positive'
                : 'negative'
            "
            :icon-right="
              toggleAttributes.findIndex(x => x === index) !== -1 ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
            "
            :label="
              getAttributeTotalSelectedQuantityCount(
                isEvoucherRedemption ? itemData.master_product_id : itemData.product_id,
                isEvoucherRedemption ? itemData.master_kitting_id : itemData.kitting_id,
                itemData.dummy.id,
                itemData.quantity === 0
              ) ===
              (productID !== null
                ? selectedInstantQty
                : selectedInstantQty * (itemData.quantity !== 0 ? itemData.quantity : itemData.foc_qty))
                ? $t('Common.ChangeSize.Text')
                : $t('Common.ChooseSize.Text')
            "
            rounded
            unelevated
            dense
            @click="attributesSelectionToggle(index)"
          />
        </td>
        <td v-else align="center">
          -
        </td>
      </tr>
      <tr
        v-if="
          itemData.dummy !== null &&
            itemData.dummy.dummy_products !== null &&
            toggleAttributes.findIndex(x => x === index) !== -1
        "
        class="bg-blue-1 animated fadeInDown"
      >
        <td colspan="4">
          <div class="row">
            <q-input
              v-model="terms[index]"
              hide-bottom-space
              dense
              outlined
              class="col-md-4"
              :label="$t('Common.SearchSizes.Placeholder')"
              clearable
              color="text-gery-6"
              @clear="results.splice(results.indexOf(index), 1)"
              @input="filterAndProcessAttributeOptions(itemData.dummy.dummy_products, index)"
            />
          </div>
        </td>
      </tr>
      <tr
        v-for="(dummy, index2) in itemData.dummy !== null
          ? results[index] !== undefined
            ? results[index]
            : itemData.dummy.dummy_products
          : []"
        v-if="toggleAttributes.findIndex(x => x === index) !== -1 && dummy.is_dummy_code !== 1"
        :id="index"
        class="animated fadeInDown bg-blue-1"
      >
        <td align="left">
          {{ dummy.sku }}
        </td>
        <td align="left">
          {{ dummy.name }}
        </td>
        <td align="center">
          {{
            getAttributeQuantityCount(
              'sizes',
              isEvoucherRedemption ? itemData.master_product_id : itemData.product_id,
              isEvoucherRedemption ? itemData.master_kitting_id : itemData.kitting_id,
              itemData.dummy.id,
              dummy.id,
              dummy.is_dummy_code,
              itemData.quantity === 0
            )
          }}
        </td>
        <td colspan="2">
          <div class="row justify-center items-baseline group">
            <div class="col-md-auto">
              <q-btn
                color="grey-7"
                :disable="
                  getAttributeTotalSelectedQuantityCount(
                    isEvoucherRedemption ? itemData.master_product_id : itemData.product_id,
                    isEvoucherRedemption ? itemData.master_kitting_id : itemData.kitting_id,
                    itemData.dummy.id,
                    itemData.quantity === 0
                  ) === 0
                "
                round
                outline
                icon="remove"
                @click="
                  minusAttributeQuantity(
                    itemData.quantity !== 0 ? itemData.quantity : itemData.foc_qty,
                    isEvoucherRedemption ? itemData.master_product_id : itemData.product_id,
                    isEvoucherRedemption ? itemData.master_kitting_id : itemData.kitting_id,
                    itemData.dummy.id,
                    'sizes',
                    dummy.id,
                    dummy.is_dummy_code,
                    itemData.quantity === 0
                  )
                "
              />
            </div>
            <div class="col-md-auto">
              <q-btn
                color="grey-7"
                :disable="
                  getAttributeTotalSelectedQuantityCount(
                    isEvoucherRedemption ? itemData.master_product_id : itemData.product_id,
                    isEvoucherRedemption ? itemData.master_kitting_id : itemData.kitting_id,
                    itemData.dummy.id,
                    itemData.quantity === 0
                  ) ===
                    (productID
                      ? selectedInstantQty
                      : selectedInstantQty * (itemData.quantity !== 0 ? itemData.quantity : itemData.foc_qty))
                "
                round
                outline
                icon="add"
                @click="
                  addAttributeQuantity(
                    itemData.quantity !== 0 ? itemData.quantity : itemData.foc_qty,
                    isEvoucherRedemption ? itemData.master_product_id : itemData.product_id,
                    isEvoucherRedemption ? itemData.master_kitting_id : itemData.kitting_id,
                    itemData.dummy.id,
                    'sizes',
                    dummy.id,
                    selectedInstantQty,
                    dummy.is_dummy_code,
                    itemData.quantity === 0
                  )
                "
              />
            </div>
          </div>
        </td>
      </tr>
      <tr
        v-if="
          ($helpers.isSet(itemData, 'product') ? itemData.product.is_dummy_code : itemData.is_dummy_code) &&
            isHA(
              itemData,
              $helpers.isSet(itemData, 'product')
                ? 'product.general.product_additional_requirements'
                : 'general.product_additional_requirements'
            )
        "
      >
        <td align="left" :data-th="tableTh[1]">
          {{
            $helpers.isSet(itemData, 'product')
              ? $helpers.getValue(itemData, 'product.sku')
              : $helpers.getValue(itemData, 'sku')
          }}
        </td>
        <td align="left" :data-th="tableTh[2]">
          {{
            $helpers.isSet(itemData, 'product')
              ? $helpers.getValue(itemData, 'product.name')
              : $helpers.getValue(itemData, 'name')
          }}
        </td>
        <td align="center" :data-th="tableTh[4]">
          -
        </td>
        <td align="right">
          <q-btn disable color="amber" outline :label="$t('Common.ChooseAddress.Text')" />
        </td>
      </tr>
    </template>
  </tbody>
</template>
<script>
import { AdditionalRequirementMixin } from 'src/application/global/mixins'

export default {
  name: 'Attributes',
  mixins: [AdditionalRequirementMixin],
}
</script>
