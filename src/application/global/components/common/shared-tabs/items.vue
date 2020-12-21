<template>
  <div class="sales-items-tab relative-position">
    <div v-if="!lockSalesOrder && showTopActionBar" class="action-bar">
      <div class="row">
        <div class="col-md-12 col-12">
          <div class="row items-center justify-start q-col-gutter-sm">
            <div class="col-md-4 col-12">
              <q-input
                v-model.trim="terms"
                hide-bottom-space
                dense
                outlined
                autofocus
                :disable="lockSalesOrder || (isRentalSales && getProducts.length + getKitting.length > 0)"
                :label="$t('Common.tab.items.placeholder.scanBarcode')"
                @keyup.enter="search()"
              />
            </div>
            <div class="col-md-8 col-12">
              <div class="row justify-between q-col-gutter-sm">
                <div class="col-auto">
                  <q-btn
                    v-shortkey="['ctrl', 'alt', 'a']"
                    class="fit"
                    unelevated
                    rounded
                    icon="add"
                    :disable="
                      lockSalesOrder ||
                        (isEsacRedemption && getEsacVouchers.length === 0) ||
                        (isRentalSales && getProducts.length + getKitting.length > 0)
                    "
                    color="positive"
                    @shortkey.native="mixActions('productListingModal')"
                    @click="mixActions('productListingModal')"
                  >
                    Add
                  </q-btn>
                </div>
                <div v-if="cartPwpItemsTempList.length > 0" class="col-auto">
                  <q-btn class="fit" unelevated rounded icon="keyboard_arrow_down" color="primary-darkened">
                    PWP
                    <q-menu ref="pwpList" anchor="bottom middle" self="top middle">
                      <q-list separator>
                        <q-item
                          v-for="(pwp, key) in cartPwpItemsTempList"
                          :key="key"
                          @click.native="revertBackPwpTempItemToCartByIndex(key), $refs.pwpList.hide()"
                        >
                          <q-item-section icon="repeat" />
                          <q-item-label>
                            <q-item-section label>
                              {{ pwp.name }}
                            </q-item-section>
                          </q-item-label>
                          <q-separator />
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
                <div
                  v-if="!isRentalSales && !isEnrollmentSearch && !isConsignmentTransaction && !disableSaleTypesButtons"
                  class="col-auto"
                >
                  <q-btn-group flat unelevated rounded>
                    <q-btn
                      color="primary-darkened"
                      unelevated
                      rounded
                      :label="$t('Common.RePurchase.Label')"
                      @click="changeItemsSaleTypeByBulk($const.masterKey.REPURCHASE)"
                    />
                    <q-btn
                      color="primary-darkened"
                      unelevated
                      rounded
                      :label="$t('Common.AMP.Label')"
                      @click="changeItemsSaleTypeByBulk($const.masterKey.AMP)"
                    />
                    <q-btn
                      color="primary-darkened"
                      unelevated
                      rounded
                      :label="$t('Common.BaUpgrade.Label')"
                      @click="changeItemsSaleTypeByBulk($const.masterKey.BAUPGRADE)"
                    />
                  </q-btn-group>
                </div>
                <div class="col-auto">
                  <q-btn
                    :hidden="salesData.status === 1"
                    :disabled="
                      cartSelectedProductIDs.length < 1 &&
                        cartPwpSelectedIDs.length < 1 &&
                        cartSelectedKittingIDs.length < 1
                    "
                    class="fit"
                    unelevated
                    rounded
                    icon="delete"
                    color="negative"
                    @click="removeRowFromCart"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="error-holder">
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <div v-if="getSaleEligibleApiErrorMsg" class="row q-mt-md items-center">
          <div class="col-12 q-py-sm custom-border bg-red-2">
            <div class="text-subtitle1,text-subtitle2 q-mx-sm">
              <q-icon color="negative" name="priority_high" />
              {{ getSaleEligibleApiErrorMsg }}
            </div>
          </div>
        </div>
      </transition>
    </div>
    <div class="content">
      <div class="row q-col-gutter-sm q-mt-xs">
        <div class="col-12">
          <q-markup-table flat dense square bordered separator="cell">
            <thead class="bg-grey-1">
              <!--TODO Make dynamic rules to display hide-->
              <tr>
                <th class="text-left">
                  {{ tableTh[0] }}
                </th>
                <th v-if="isEsacRedemption" class="text-center">
                  {{ tableTh[1] }}
                </th>
                <th width="18%" class="text-center">
                  {{ tableTh[2] }}
                </th>
                <th width="18%" class="text-center">
                  {{ tableTh[3] }}
                </th>
                <th v-show="showTransactionTypeColumn" width="18%" class="text-center">
                  {{ tableTh[4] }}
                </th>
                <th v-show="showAvailableQuantityColumn" class="text-center">
                  {{ tableTh[5] }}
                </th>
                <th class="text-center">
                  {{ tableTh[6] }}
                </th>
                <th v-if="!isEsacRedemption && showCVColumns" class="text-center">
                  {{ tableTh[7] }}
                </th>
                <th v-if="!isEsacRedemption && showCVColumns" class="text-center">
                  {{ tableTh[8] }}
                </th>
                <th class="text-center">{{ tableTh[9] }} ({{ currencyLabelByCountry }})</th>
                <th class="text-center text-red">{{ tableTh[10] }} ({{ currencyLabelByCountry }})</th>
              </tr>
            </thead>
            <tbody>
              <!-- todo break all TR to single component -->
              <!-- standard products -->
              <tr
                v-for="(product, index) in getProducts"
                :key="`standard-${index}`"
                class=" standard-product"
                :class="{
                  'bg-yellow-2': getAdditionalAttributesInvalidRowStatus('product_ids', product.product_id),
                  'bg-green-2': $helpers.getValue(product, 'is_subscription_item', false),
                  'invalid bg-red-2': $helpers.getValue(product, 'is_invalid_transaction_type'),
                }"
              >
                <td class="text-left" :data-th="tableTh[0]">
                  <q-checkbox
                    v-if="!lockSalesOrder && !hideRemoveItemRowCheckbox && $helpers.getValue(product, 'editable', true)"
                    v-model="cartSelectedProductIDs"
                    :disable="cartPwpSelectedIDs.length > 0"
                    :val="product.product_id"
                  />
                  <q-btn
                    v-if="!lockSalesOrder && product.is_dummy_code"
                    icon="add_circle_outline"
                    color="blue"
                    flat
                    dense
                    @click="
                      mixActions(
                        'standardProductModal',
                        'standard',
                        product,
                        product.name,
                        product.sku,
                        product.id,
                        product[quantityIdentifier]
                      ),
                        (DefaultTab = 'Components')
                    "
                  />
                  <q-icon
                    v-if="!lockSalesOrder && getAdditionalAttributesInvalidRowStatus('product_ids', product.product_id)"
                    class="animate-blink text-negative"
                    name="priority_high"
                  />
                </td>
                <td v-show="isEsacRedemption" :data-th="tableTh[1]" />
                <td :data-th="tableTh[2]">
                  {{ product.sku }}
                  <q-btn
                    v-if="!$helpers.isNull(product.evoucher)"
                    dense
                    icon="launch"
                    size="xs"
                    flat
                    color="primary text-primary"
                    :to="{ name: 'eVoucher Redemption Details', params: { evoucherID: product.evoucher.id } }"
                    :label="$t('Common.Evoucher.Text')"
                  />
                </td>
                <td class="text-left" :data-th="tableTh[3]">
                  {{ product.name }}
                </td>
                <td
                  v-show="showTransactionTypeColumn"
                  :class="$helpers.getValue(product, 'is_invalid_transaction_type') ? 'text-left' : 'text-center'"
                  :data-th="tableTh[4]"
                >
                  <q-select
                    v-if="!$helpers.getValue(product, 'is_invalid_transaction_type')"
                    v-model="product.transaction_type_id || product.transaction_type"
                    hide-bottom-space
                    options-dense
                    dense
                    emit-value
                    map-options
                    outlined
                    class="no-margin"
                    :readonly="
                      lockSalesOrder ||
                        isRentalSales ||
                        $helpers.getValue(product, 'is_subscription_item', false) ||
                        !$helpers.getValue(product, 'editable', true)
                    "
                    :error="
                      !lockSalesOrder && validations.products.$each[index].transaction_type !== undefined
                        ? validations.products.$each[index].transaction_type.$invalid
                        : false
                    "
                    :options="masterDataOptionsCreator('sale_types', getOptionalCompressionSaleTypeOptions(product))"
                    @input="reCalculateCart(functionType)"
                  />
                  <span v-else class="text-red text-caption">
                    <q-icon name="priority_high" /> Chosen trans type no longer valid this item will excluded from
                    original sales
                  </span>
                </td>
                <td v-show="showAvailableQuantityColumn" :data-th="tableTh[5]">
                  {{
                    product.available_quantity !== undefined && product.available_quantity !== null
                      ? product.available_quantity
                      : '-'
                  }}
                </td>
                <td :data-th="tableTh[6]">
                  <q-input
                    v-model="product[quantityIdentifier]"
                    hide-bottom-space
                    dense
                    outlined
                    type="number"
                    min="1"
                    class="no-margin"
                    :readonly="
                      (lockSalesOrder ||
                        disableProductKittingQuantityChange ||
                        $helpers.getValue(product, 'is_subscription_item', false) ||
                        !$helpers.getValue(product, 'editable', true)) &&
                        disableQtyChangeForConsignmentOrderReturn
                    "
                    :error="validations.products.$each[index][quantityIdentifier].$invalid"
                    @input="
                      reCalculateCart(functionType, product.product_id),
                        resetAdditionalRequirementItems(product.product_id, false),
                        validations.products.$each[index] !== null && validations.products.$each[index] !== undefined
                          ? validations.products.$each[index][quantityIdentifier].$touch
                          : ''
                    "
                  />
                </td>
                <td v-show="!isEsacRedemption && showCVColumns" :data-th="tableTh[7]">
                  {{ getUnitCvByTransactionType('product', product.product_id, product.base_price.base_cv) }}
                </td>
                <td v-show="!isEsacRedemption && showCVColumns" :data-th="tableTh[8]">
                  {{
                    getUnitCvByTransactionType('product', product.product_id, product.base_price.base_cv) *
                      product[quantityIdentifier]
                  }}
                </td>
                <td :data-th="tableTh[9]">
                  {{ product.base_price.gmp_price_tax | formatPriceDouble }}
                </td>
                <td :data-th="tableTh[10]" class="text-weight-bold">
                  {{
                    (product.base_price.gmp_price_tax *
                      (!validations.products.$each[index][quantityIdentifier].$invalid
                        ? product[quantityIdentifier]
                        : 0))
                      | formatPriceDouble
                  }}
                </td>
              </tr>
              <!-- kitting products -->
              <tr
                v-for="(kitting, index) in getKitting"
                :key="`kitting-${index}`"
                class=" kitting-product"
                :class="{
                  'bg-yellow-2': getAdditionalAttributesInvalidRowStatus('kitting_ids', kitting.kitting_id),
                  'bg-green-2': $helpers.getValue(kitting, 'is_subscription_item', false),
                  'invalid bg-red-2': $helpers.getValue(kitting, 'is_invalid_transaction_type'),
                }"
              >
                <td class="text-left" :data-th="tableTh[0]">
                  <q-checkbox
                    v-if="
                      !$helpers.getValue(kitting, 'is_subscription_item', false) &&
                        !lockSalesOrder &&
                        !hideRemoveItemRowCheckbox &&
                        $helpers.getValue(kitting, 'editable', true)
                    "
                    v-model="cartSelectedKittingIDs"
                    :disable="cartPwpSelectedIDs.length > 0"
                    :val="kitting.kitting_id"
                  />
                  <q-btn
                    icon="add_circle_outline"
                    color="blue"
                    flat
                    dense
                    @click="
                      mixActions(
                        'kittingProductsListModal',
                        'kitting',
                        kitting.kitting_products,
                        kitting.name,
                        kitting.code,
                        kitting.kitting_id,
                        kitting[quantityIdentifier],
                        kitting.dummy
                      ),
                        (kittingDefaultTab = 'kitComponents')
                    "
                  />
                  <q-icon
                    v-if="getAdditionalAttributesInvalidRowStatus('kitting_ids', kitting.kitting_id)"
                    class="animate-blink text-negative"
                    name="priority_high"
                  />
                </td>
                <td v-show="isEsacRedemption" :data-th="tableTh[1]" />
                <td :data-th="tableTh[2]">
                  {{ kitting.code }}
                  <q-btn
                    v-if="!$helpers.isNull(kitting.evoucher)"
                    dense
                    icon="launch"
                    size="xs"
                    flat
                    color="primary text-primary"
                    :to="{ name: 'eVoucher Redemption Details', params: { evoucherID: kitting.evoucher.id } }"
                    :label="$t('Common.Evoucher.Text')"
                  />
                </td>
                <td class="text-left" :data-th="tableTh[3]">
                  {{ kitting.name }}
                </td>
                <td v-show="showTransactionTypeColumn" class="text-left" :data-th="tableTh[4]">
                  <q-select
                    v-if="!$helpers.getValue(kitting, 'is_invalid_transaction_type')"
                    v-model="kitting.transaction_type_id || kitting.transaction_type"
                    hide-bottom-space
                    options-dense
                    dense
                    emit-value
                    map-options
                    outlined
                    class="no-margin"
                    :readonly="
                      lockSalesOrder ||
                        isRentalSales ||
                        $helpers.getValue(kitting, 'is_subscription_item', false) ||
                        !$helpers.getValue(kitting, 'editable', true)
                    "
                    :error="
                      !lockSalesOrder && validations[kittingIdentifier].$each[index].transaction_type !== undefined
                        ? validations[kittingIdentifier].$each[index].transaction_type.$invalid
                        : false
                    "
                    :options="masterDataOptionsCreator('sale_types', getOptionalCompressionSaleTypeOptions(kitting))"
                    @input="reCalculateCart(functionType)"
                  />
                  <span v-else class="text-red text-caption">
                    <q-icon name="priority_high" /> Chosen trans type no longer valid this item will excluded from
                    original sales
                  </span>
                </td>
                <td v-show="showAvailableQuantityColumn" :data-th="tableTh[5]">
                  {{
                    kitting.available_quantity !== undefined && kitting.available_quantity !== null
                      ? kitting.available_quantity
                      : '-'
                  }}
                </td>
                <td :data-th="tableTh[6]">
                  <q-input
                    v-model="kitting[quantityIdentifier]"
                    hide-bottom-space
                    dense
                    outlined
                    type="number"
                    :readonly="
                      (lockSalesOrder ||
                        disableProductKittingQuantityChange ||
                        $helpers.getValue(kitting, 'is_subscription_item', false) ||
                        !$helpers.getValue(kitting, 'editable', true)) &&
                        disableQtyChangeForConsignmentOrderReturn
                    "
                    min="1"
                    class="no-margin"
                    :error="validations[kittingIdentifier].$each[index][quantityIdentifier].$invalid"
                    @input="
                      reCalculateCart(functionType, kitting.kitting_id),
                        resetAdditionalRequirementItems(false, kitting.kitting_id),
                        validations[kittingIdentifier].$each[index][quantityIdentifier].$touch
                    "
                  />
                </td>
                <td v-show="!isEsacRedemption && showCVColumns" :data-th="tableTh[7]">
                  {{ getUnitCvByTransactionType('kitting', kitting.kitting_id, kitting.kitting_price.base_cv) }}
                </td>
                <td v-show="!isEsacRedemption && showCVColumns" :data-th="tableTh[8]">
                  {{
                    getUnitCvByTransactionType('kitting', kitting.kitting_id, kitting.kitting_price.base_cv) *
                      kitting[quantityIdentifier]
                  }}
                </td>
                <td :data-th="tableTh[9]">
                  {{ kitting.kitting_price.gmp_price_tax | formatPriceDouble }}
                </td>
                <td :data-th="tableTh[10]" class="text-weight-bold">
                  {{
                    (kitting.kitting_price.gmp_price_tax *
                      (!validations[kittingIdentifier].$each[index][quantityIdentifier].$invalid
                        ? kitting[quantityIdentifier]
                        : 0))
                      | formatPriceDouble
                  }}
                </td>
              </tr>
              <!-- promotion products -->
              <tr
                v-for="(promo, index) in getPromotions"
                v-if="(check = promoOptionItemRowValidationCount(promo.promo_id, promo.conditions))"
                :key="`promotion-${index}`"
                class=" promotion-product"
                :class="{ 'bg-yellow-4': check !== undefined && check.promoCount !== check.productCount }"
              >
                <td class="text-left" :data-th="tableTh[0]">
                  <span
                    v-if="
                      setPromotionalRowCurrentStatus({
                        promoID: promo.promo_id,
                        valid: check.promoCount === check.productCount,
                      })
                    "
                    class="hidden"
                  />
                  <q-checkbox
                    v-if="!lockSalesOrder || isRentalSales"
                    v-model="cartPwpSelectedIDs"
                    :disable="
                      promo.promo_type_id === focID ||
                        promo.promo_type_id === pwpFID ||
                        cartSelectedProductIDs.length > 0
                    "
                    :val="promo.promo_id"
                  />
                  <q-btn
                    icon="add_circle_outline"
                    color="negative"
                    flat
                    dense
                    @click="mixActions('promotionProductsListModal', 'promotion', promo, promo.name)"
                  />
                  <q-icon
                    v-if="typeof check !== 'undefined' && check.promoCount !== check.productCount"
                    class="animate-blink text-negative"
                    name="priority_high"
                  />
                </td>
                <td v-show="isEsacRedemption" :data-th="tableTh[1]" />
                <td :data-th="tableTh[2]">
                  {{ getPromoTypeNameByID(promo.promo_type_id) }}
                </td>
                <td class="text-left" :data-th="tableTh[3]">
                  {{ promo.name }}
                </td>
                <td v-show="showTransactionTypeColumn" :data-th="tableTh[4]" />
                <td v-show="showAvailableQuantityColumn" :data-th="tableTh[5]">
                  -
                </td>
                <td :data-th="tableTh[6]">
                  {{ getPromoItemRowPwpItemQty(promo.promo_id) }}
                </td>
                <td v-show="!isEsacRedemption && showCVColumns" :data-th="tableTh[7]">
                  -
                </td>
                <td v-show="!isEsacRedemption && showCVColumns" :data-th="tableTh[8]">
                  -
                </td>
                <td :data-th="tableTh[9]">
                  {{ promo.pwp_value > 0 ? promo.pwp_value : 0.0 | formatPriceDouble }}
                </td>
                <td :data-th="tableTh[10]" class="text-weight-bold">
                  {{
                    promo.pwp_value > 0
                      ? promo.pwp_value * getPromoItemRowPwpItemQty(promo.promo_id, promo.promo_type_id)
                      : 0.0 | formatPriceDouble
                  }}
                </td>
              </tr>
              <!-- esac products -->
              <tr
                v-for="(esacVoucher, index) in getEsacVouchers"
                v-if="isEsacRedemption"
                :key="`esac-${index}`"
                class=" esac-voucher"
              >
                <td class="text-left" :data-th="tableTh[0]">
                  -
                </td>
                <td v-show="isEsacRedemption" :data-th="tableTh[1]">
                  {{ esacVoucher.voucher_number }}
                </td>
                <td class="text-center" :data-th="tableTh[2]">
                  -
                </td>
                <td class="text-center" :data-th="tableTh[3]">
                  -
                </td>
                <td v-show="showTransactionTypeColumn" class="text-left" :data-th="tableTh[4]" />
                <td v-show="showAvailableQuantityColumn" :data-th="tableTh[5]" />
                <td :data-th="tableTh[5]">
                  <q-input hide-bottom-space dense outlined readonly disabled :value="1" />
                </td>
                <td v-show="!isEsacRedemption && showCVColumns" :data-th="tableTh[6]" />
                <td v-show="!isEsacRedemption && showCVColumns" :data-th="tableTh[7]" />
                <td :data-th="tableTh[8]">
                  {{ (-1 * parseFloat(esacVoucher.voucher_value)) | formatPriceDouble }}
                </td>
                <td :data-th="tableTh[9]">
                  {{ (-1 * parseFloat(esacVoucher.voucher_value)) | formatPriceDouble }}
                </td>
              </tr>
              <!-- standard free products -->
              <tr
                v-for="(free_item, index) in getFreeItems"
                :key="`free-${index}`"
                class=" standard-product-free-items"
              >
                <td class="text-left" :data-th="tableTh[0]">
                  <q-chip dense square>
                    FOC
                  </q-chip>
                </td>
                <td v-show="isEsacRedemption" :data-th="tableTh[1]" />
                <td :data-th="tableTh[2]">
                  {{ free_item.sku }}
                </td>
                <td class="text-left" :data-th="tableTh[3]">
                  {{ free_item.name }}
                </td>
                <td v-show="showTransactionTypeColumn" class="text-left" :data-th="tableTh[4]">
                  <q-select
                    v-model="free_item.transaction_type_id || free_item.transaction_type"
                    hide-bottom-space
                    options-dense
                    dense
                    emit-value
                    map-options
                    outlined
                    class="no-margin"
                    disable
                    :options="masterDataOptionsCreator('sale_types', getOptionalCompressionSaleTypeOptions(free_item))"
                  />
                </td>
                <td v-show="showAvailableQuantityColumn" :data-th="tableTh[5]">
                  {{
                    free_item.available_quantity !== undefined && free_item.available_quantity !== null
                      ? free_item.available_quantity
                      : '-'
                  }}
                </td>
                <td :data-th="tableTh[6]">
                  <q-input
                    v-model="free_item.quantity"
                    hide-bottom-space
                    dense
                    outlined
                    type="number"
                    min="1"
                    class="no-margin"
                    disable
                  />
                </td>
                <td v-show="!isEsacRedemption && showCVColumns" :data-th="tableTh[7]">
                  {{ getUnitCvByTransactionType('product', free_item.product_id) }}
                </td>
                <td v-show="!isEsacRedemption && showCVColumns" :data-th="tableTh[8]">
                  {{ getUnitCvByTransactionType('product', free_item.product_id) * free_item.quantity }}
                </td>
                <td :data-th="tableTh[9]">
                  {{ free_item.base_price.gmp_price_tax | formatPriceDouble }}
                </td>
                <td :data-th="tableTh[10]" class="text-weight-bold">
                  {{ (free_item.base_price.gmp_price_tax * free_item.quantity) | formatPriceDouble }}
                </td>
              </tr>
              <!-- total section -->
              <tr
                v-if="
                  this.showTotalRow &&
                    this.totalGMP !== undefined &&
                    this.totalGMP !== null &&
                    (getProducts.length > 0 || getKitting.length > 0)
                "
                class="text-weight-bold bg-grey-1"
              >
                <td
                  align="right"
                  :colspan="
                    9 -
                      (!showCVColumns || isEsacRedemption ? 2 : 0) -
                      (!showTransactionTypeColumn ? 1 : 0) -
                      (!isEsacRedemption ? 1 : 0)
                  "
                >
                  Total
                </td>
                <td>{{ this.totalGMP | formatPriceDouble }}</td>
              </tr>
              <tr
                v-if="
                  !(
                    getProducts.length > 0 ||
                    getKitting.length > 0 ||
                    getPromotions.length > 0 ||
                    getEsacVouchers.length > 0 ||
                    getFreeItems.length > 0
                  )
                "
              >
                <td :colspan="7 + (isEsacRedemption ? 0 : 2) + (lockSalesOrder ? 1 : 0)">
                  <empty-list />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
          <div v-if="!lockSalesOrder" class="error-holder">
            <q-field class="required" hide-bottom-space :error="isCartError" />
          </div>
        </div>
        <div class="col-12">
          <div class="row justify-end">
            <div class="col-md-auto">
              <q-btn
                v-if="getDeliverInfo.length > 0"
                class="fit"
                unelevated
                rounded
                :label="$t('Common.DeliveryInfo.Text')"
                icon="open_in_new"
                @click="openCloseModal({ name: 'deliveryInfoModal', status: true })"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--    Promotions modal-->
    <layout-modal
      refs="promotionProductsListModal"
      url-reset-path-name=""
      :title="promotionsModalData.title"
      :shadow="false"
      min-width="55vw"
      min-height="90vh"
      footer-button-two="Close"
      :header-search-bar="false"
      :no-esc-dismiss="false"
      :search="true"
      classes="transparent text-black"
    >
      <template slot="modal-data" slot-scope="props">
        <div
          v-if="
            typeof promotionsModalData.data !== 'undefined' &&
              Object.keys(promotionsModalData.data).length > 0 &&
              typeof promotionsModalData.data.conditions !== 'undefined'
          "
          class="row"
        >
          <div class="col-md-12">
            <div
              v-for="(option, indexOptions) in promotionsModalData.data.conditions.options"
              :key="indexOptions"
              class="options"
            >
              <div class="options-holder fa-border fit bg-grey-1">
                <div v-for="(set, optionKey) in option" :key="`option-key-${optionKey}`" class="options-set">
                  <div class="options-title">
                    <p class="text-h6 text-negative">
                      {{ $t('Common.Choose.Text') }}
                    </p>
                    <p
                      v-if="!getPwpPromoType(promotionsModalData.data.promo_type_id, $const.masterData.PWPF)"
                      class="text-h6 text-weight-bold"
                    >
                      {{ $t('Common.Each.Text') }}@{{ currencyLabelByCountry }}
                      {{ promotionsModalData.data.pwp_value | formatPriceDouble }}
                    </p>
                  </div>
                  <div v-for="(product, setKey) in set" v-if="setKey !== 'option_id'" class="options-product">
                    <div v-if="product.length > 1 && product[0]" class="select-all">
                      <div class="row justify-end pwp-option q-col-gutter-lg">
                        <div v-if="!lockSalesOrder" class="col-md-auto">
                          <q-btn
                            v-if="
                              !limitBulkItemRowSelectionByOperator(
                                product,
                                promotionsModalData.data.conditions.operator,
                                setKey
                              )
                            "
                            outline
                            :disable="
                              limitBulkItemRowSelectionByOperator(
                                product,
                                promotionsModalData.data.conditions.operator,
                                setKey
                              )
                            "
                            :color="getBulkSelectionButtonStatus(product, setKey) ? 'negative' : 'primary'"
                            @click="
                              setBulkSelectionProducts(
                                product,
                                promotionsModalData.data.conditions.operator,
                                setKey,
                                promotionsModalData.data.pwp_value
                              )
                            "
                          >
                            {{ getBulkSelectionButtonStatus(product, setKey) ? 'Remove Selection' : 'Select' }}
                          </q-btn>
                        </div>
                      </div>
                    </div>
                    <div
                      v-for="(item, itemsKey) in product"
                      :key="`items-key-${itemsKey}`"
                      class="options-items"
                      :class="{
                        'q-pa-sm': getBulkSelectionButtonStatus(product, setKey),
                        'bg-grey-1 q-pa-sm disabled': limitBulkItemRowSelectionByOperator(
                          product,
                          promotionsModalData.data.conditions.operator,
                          setKey
                        ),
                      }"
                      :color="getBulkSelectionButtonStatus(product, setKey) ? 'negative' : 'primary'"
                    >
                      <div class="row items-center justify-between">
                        <div class="col-md-9 col-12">
                          <div class="row q-col-gutter-md content-between items-center">
                            <div class="col-md-3 col-12">
                              <q-input
                                v-model.trim="item.product.sku"
                                hide-bottom-space
                                dense
                                outlined
                                readonly
                                :label="$t('products.pwpfoc.productCode')"
                              />
                            </div>
                            <div
                              class="col-12"
                              :class="{
                                'col-md-7': !getPwpPromoType(
                                  promotionsModalData.data.promo_type_id,
                                  $const.masterData.PWPN
                                ),
                              }"
                            >
                              <q-input
                                v-model.trim="item.product.name"
                                hide-bottom-space
                                dense
                                outlined
                                readonly
                                :label="$t('products.pwpfoc.productName')"
                              />
                            </div>
                            <div
                              v-if="!getPwpPromoType(promotionsModalData.data.promo_type_id, $const.masterData.PWPN)"
                              class="col-md-auto col-12"
                            >
                              X {{ item.quantity }}
                            </div>
                            <div v-else-if="!lockSalesOrder" class="col-md-4 col-12">
                              <q-select
                                v-model="item.quantity_selected"
                                hide-bottom-space
                                options-dense
                                dense
                                emit-value
                                map-options
                                outlined
                                color="text-grey-6"
                                :label="
                                  $t('Common.tab.items.label.PreSelected') +
                                    (item.quantity_selected === undefined ? item.quantity : item.quantity_selected) +
                                    '/' +
                                    item.quantity
                                "
                                :disable="
                                  !getPromoOptionItemRowStatus(item.option_id, item.id, item.product_id, setKey)
                                "
                                :options="quantityOptionsGenerator(item, item.quantity)"
                                @input="
                                  setPwpSelectedQuantity(
                                    item.promo_id,
                                    item.option_id,
                                    item.id,
                                    item.product_id,
                                    item.quantity_selected
                                  )
                                "
                              />
                            </div>
                            <div v-else class="col-auto">
                              X {{ getPwpSelectedQuantity(item.promo_id, item.option_id, item.id, item.product_id) }}
                            </div>
                          </div>
                        </div>
                        <div v-if="!lockSalesOrder" class="col-md-3 col-12">
                          <div class="row justify-end">
                            <div
                              v-if="
                                product.length > 1 &&
                                  !limitPromotionItemRowSelectionByOperator(
                                    item.promo_id,
                                    item.option_id,
                                    item.id,
                                    item.product_id,
                                    promotionsModalData.data.conditions.operator,
                                    setKey
                                  )
                              "
                              class="col-md-auto"
                            >
                              <q-btn
                                v-if="!getPromoOptionItemRowStatus(item.option_id, item.id, item.product_id, setKey)"
                                disable
                                class="no-pointer-events"
                                outline
                                color="grey-6"
                              >
                                {{ $t('Common.tab.items.label.select') }}
                              </q-btn>
                              <q-btn v-else color="grey-6" disable outline>
                                {{ $t('Common.tab.items.label.selected') }}
                              </q-btn>
                            </div>
                            <div v-else class="col-md-12">
                              <q-btn
                                v-if="
                                  !limitPromotionItemRowSelectionByOperator(
                                    item.promo_id,
                                    item.option_id,
                                    item.id,
                                    item.product_id,
                                    promotionsModalData.data.conditions.operator,
                                    setKey
                                  )
                                "
                                outline
                                :disable="
                                  limitPromotionItemRowSelectionByOperator(
                                    item.promo_id,
                                    item.option_id,
                                    item.id,
                                    item.product_id,
                                    promotionsModalData.data.conditions.operator,
                                    setKey
                                  )
                                "
                                :color="
                                  getPromoOptionItemRowStatus(item.option_id, item.id, item.product_id, setKey)
                                    ? 'negative'
                                    : 'primary'
                                "
                                @click="
                                  !getPromoOptionItemRowStatus(item.option_id, item.id, item.product_id, setKey)
                                    ? setPromoOptionsItemRow(
                                        item.promo_id,
                                        item.option_id,
                                        item.id,
                                        item.product_id,
                                        promotionsModalData.data.conditions.operator,
                                        setKey,
                                        promotionsModalData.data.pwp_value,
                                        item.quantity
                                      )
                                    : removePromoOptionItemRow(
                                        item.option_id,
                                        item.id,
                                        promotionsModalData.data.promo_id,
                                        promotionsModalData.data.conditions.operator,
                                        promotionsModalData.data.pwp_value
                                      ),
                                    promoOptionItemRowValidationCount(
                                      item.promo_id,
                                      promotionsModalData.data.conditions
                                    )
                                "
                              >
                                {{
                                  getPromoOptionItemRowStatus(item.option_id, item.id, item.product_id, setKey)
                                    ? 'Remove Selection'
                                    : 'Select'
                                }}
                              </q-btn>
                            </div>
                          </div>
                        </div>
                        <div
                          v-if="lockSalesOrder && getBulkSelectionButtonStatus(product, setKey)"
                          class="col-md-auto col-12"
                        >
                          <q-icon color="positive" name="done" size="2rem" />
                        </div>
                      </div>
                    </div>
                    <div v-if="setKey !== Object.keys(set).pop()" class="options-or bg-grey-1">
                      <div class="row justify-center q-my-lg q-col-gutter-sm">
                        <div class="col-md-12">
                          <q-separator />
                        </div>
                        <div class="col-auto" style="position: relative; top: -21px">
                          <div class="options-or-btn-decoration">
                            <q-btn
                              unelevated
                              rounded
                              color="primary-darkened"
                              disable
                              class="z-max no-pointer-events text-uppercase"
                              size="sm"
                            >
                              {{ $t('Common.Or.Text') }}
                            </q-btn>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="promotionsModalData.data.conditions.options.length - 1 !== indexOptions"
                class="row justify-center"
              >
                <div class="col-md-12">
                  <q-btn class="full-width no-shadow no-pointer-events text-black">
                    {{ promotionsModalData.data.conditions.operator }}
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="row">
          <div class="col-md-12">
            <empty-list />
          </div>
        </div>
      </template>
    </layout-modal>
    <!--    Kitting modal-->
    <layout-modal
      refs="kittingProductsListModal"
      url-reset-path-name=""
      :title="kittingModalData.kittingCode + ' : ' + kittingModalData.title"
      :sub-title="'Total set Quantiy : ' + kittingModalData.kittingQty"
      :shadow="false"
      min-width="70vw"
      min-height="90vh"
      footer-button-two="Close"
      :header-search-bar="false"
      :no-esc-dismiss="false"
      :search="true"
      classes="transparent text-black"
    >
      <template slot="modal-data" slot-scope="props">
        <q-tabs
          v-model="kittingDefaultTab"
          align="left"
          indicator-color="primary-darkened"
          active-bg-color="primary text-white"
        >
          <q-tab name="kitComponents" :label="$t('Common.tab.items.label.kitComponents')" />
          <q-tab
            v-if="itemsRedemptionEligibility(kittingModalData.items) || lockSalesOrder"
            name="redemption"
            :label="$t('Common.tab.items.label.redemption')"
          />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="kittingDefaultTab">
          <q-tab-panel name="kitComponents" class="no-border bg-white sales-items shadow-1 no-padding">
            <!-- kitComponents-->
            <q-markup-table bordered dense flat separator="cell">
              <thead class="bg-grey-2">
                <tr>
                  <th>{{ $t('Common.tab.items.tableLabel.productCode') }}</th>
                  <th>{{ $t('Common.tab.items.tableLabel.productName') }}</th>
                  <th>{{ $t('Common.tab.items.tableLabel.Quantity') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in kittingModalData.items">
                  <td>{{ item.product.sku }}</td>
                  <td>{{ item.product.name }}</td>
                  <td>
                    {{
                      !lockSalesOrder
                        ? item.quantity !== 0
                          ? item.quantity * kittingModalData.kittingQty
                          : item.foc_qty * kittingModalData.kittingQty
                        : item.quantity !== 0
                        ? item.quantity
                        : item.foc_qty
                    }}
                    <span v-if="item.foc_qty > 0" class="text-grey-5"> (FOC) </span>
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
            <!-- kitComponents End -->
          </q-tab-panel>
          <q-tab-panel name="redemption" class="no-border bg-white sales-items shadow-1 no-padding">
            <!-- Redemption-->
            <div class="sizes-and-ha-area">
              <additional-requirements
                :disable-additional-requirements="disableAdditionalRequirements"
                :disable-evoucher="disableEvoucher"
                :additional-requirements="getSelectedAdditionalRequirements"
                :items-data="kittingModalData.items"
                :kitting-i-d="kittingModalData.kittingID"
                :item-qty="kittingModalData.kittingQty"
                :table-th="tableTh"
              />
            </div>
            <!-- Redemption End -->
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </layout-modal>
    <!--    Product Modal-->
    <layout-modal
      refs="standardProductModal"
      url-reset-path-name=""
      :title="standardProductModalData.productCode + ' : ' + standardProductModalData.title"
      :sub-title="'Total set Quantiy : ' + standardProductModalData.productQty"
      :shadow="false"
      min-width="70vw"
      min-height="90vh"
      footer-button-two="Close"
      :header-search-bar="false"
      :no-esc-dismiss="false"
      :search="true"
      classes="transparent text-black"
    >
      <template slot="modal-data" slot-scope="props">
        <q-tabs
          v-model="productDefaultTab"
          align="left"
          indicator-color="primary-darkened"
          active-bg-color="primary text-white"
        >
          <q-tab
            v-if="itemsRedemptionEligibility(standardProductModalData.items, 'is_dummy_code')"
            name="redemption"
            :label="$t('Common.tab.items.label.redemption')"
          />
        </q-tabs>
        <q-tab-panels v-model="productDefaultTab">
          <q-tab-panel name="redemption" class="no-border bg-white sales-items shadow-1 no-padding">
            <!-- Redemption-->
            <div class="sizes-and-ha-area">
              <additional-requirements
                :disable-additional-requirements="disableAdditionalRequirements"
                :disable-evoucher="disableEvoucher"
                :additional-requirements="getSelectedAdditionalRequirements"
                :items-data="standardProductModalData.items"
                :product-i-d="standardProductModalData.productID"
                :item-qty="standardProductModalData.productQty"
                :table-th="tableTh"
              />
            </div>
            <!-- Redemption End -->
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </layout-modal>
    <!--    Product listing modal-->
    <layout-modal
      refs="productListingModal"
      url-reset-path-name=""
      title="Product Listing"
      :shadow="false"
      autogrow
      footer-button-two="Close"
      :header-search-bar="true"
      :no-esc-dismiss="false"
      :search="true"
    >
      <template slot="modal-data" slot-scope="props">
        <listing-search-form
          :filters="filters"
          :exclude-filters="excludeFilters"
          :sales-data="salesData"
          :member-details="memberDetails"
          :add-to-cart="addToCart"
          :is-rental-sales="isRentalSales"
          :is-consignment-return="isConsignmentReturn"
          :exclude-kitting-search="excludeKittingSearch"
          :is-enrollment-search="isEnrollmentSearch"
          :enrollment-type-i-d="enrollmentTypeID"
          :enrollment-country-i-d="enrollmentCountryID"
          :transaction-location-id="getTransactionLocationID"
          :filter-by-sale-types="filterBySaleTypes"
        />
      </template>
    </layout-modal>
    <!--    Delivery info modal-->
    <layout-modal
      refs="deliveryInfoModal"
      url-reset-path-name=""
      :title="$t('DeliveryInfo.Title')"
      :shadow="false"
      min-width="70vw"
      min-height="90vh"
      footer-button-two="Close"
      :header-search-bar="false"
      :no-esc-dismiss="false"
      :search="true"
      classes="transparent text-black"
    >
      <template slot="modal-data" slot-scope="props">
        <q-markup-table flat dense square bordered separator="cell">
          <thead>
            <th width="25%" class="bg-grey-1">
              {{ $t('Common.ProductName.Text') }}
            </th>
            <th class="bg-grey-1">
              {{ $t('Common.Provider.Text') }}
            </th>
            <th class="bg-grey-1 text-center">
              {{ $t('Common.DeliveryStages.Text') }}
            </th>
          </thead>
          <tbody>
            <tr v-for="item in getDeliverInfo">
              <td :data-th="$t('Common.ProductName.Text')">
                <q-chip dense square>
                  {{ item.code }}
                </q-chip>
                {{ item.name }}
              </td>
              <td :data-th="$t('Common.Provider.Text')">
                <h6 class="text-uppercase">
                  {{ item.provider }}
                </h6>
              </td>
              <td :data-th="$t('Common.DeliveryStages.Text')">
                <q-timeline color="positive">
                  <q-timeline-entry
                    v-for="(stage, index) in item.stages"
                    :key="`stage-${index}`"
                    :title="stage.status.title"
                    :subtitle="stage.created_at + ' (' + humanizeDateTime(stage.created_at) + ')'"
                    side="left"
                  >
                    <div>
                      <small
                        >Consignment Number: <b>{{ stage.consignment_order_number }}</b></small
                      ><br />
                      <small
                        >DO Number: <b>{{ stage.delivery_order_number }}</b></small
                      ><br />
                      <small
                        >Quantity: <b>{{ stage.delivered_quantity }}</b></small
                      >
                    </div>
                  </q-timeline-entry>
                </q-timeline>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </template>
    </layout-modal>
  </div>
</template>
<script>
import EmptyList from 'src/application/global/components/common/empty/emptyList.vue'
import layoutModal from 'src/application/global/components/common/modal/layoutModal'
import { ListingSearchForm } from 'src/application/global/components/common/shared-forms/index'
import { DatesMixin, GeneralsMixin, MasterDataTransformarMixin } from 'src/application/global/mixins'
import { AdditionalRequirements } from 'src/application/global/components/common/shared-blocks/index'
import { Dialog } from 'quasar'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'SalesItemsTab',
  components: {
    EmptyList,
    layoutModal,
    ListingSearchForm,
    AdditionalRequirements,
  },
  mixins: [MasterDataTransformarMixin, GeneralsMixin, DatesMixin],
  props: {
    salesData: {
      type: Object,
      default: () => {},
    },
    memberDetails: {
      default: () => {},
    },
    addToCart: {
      type: Function,
      required: true,
    },
    lockSalesOrder: {
      type: Boolean,
      default: true,
    },
    // pass in the parent structure that contains products, kittings array, not the root $v object
    validations: {
      type: Object,
      required: true,
    },
    excludeKittingSearch: {
      type: Boolean,
      default: false,
    },
    showTotalRow: {
      type: Boolean,
      default: false,
    },
    totalGMP: {
      type: Number,
    },
    showCVColumns: {
      type: Boolean,
      default: true,
    },
    showTransactionTypeColumn: {
      type: Boolean,
      default: true,
    },
    showAvailableQuantityColumn: {
      type: Boolean,
      default: false,
    },
    isRentalSales: {
      type: Boolean,
      default: false,
    },
    isConsignmentReturn: {
      type: Boolean,
      default: false,
    },
    disableProductKittingQuantityChange: {
      type: Boolean,
      default: false,
    },
    isEnrollmentSearch: {
      type: Boolean,
      default: false,
    },
    enrollmentTypeID: {
      type: Number,
      default: -1,
    },
    enrollmentCountryID: {
      type: Number,
      default: 0,
    },
    isConsignmentTransaction: {
      type: Boolean,
      default: false,
    },
    showTopActionBar: {
      type: Boolean,
      default: true,
    },
    disableQtyChangeForConsignmentOrderReturn: {
      type: Boolean,
      default: true,
    },
    disableEvoucher: {
      type: Boolean,
      default: false,
    },
    filters: {
      type: Array,
      default: () => [],
    },
    excludeFilters: {
      type: Array,
      default: () => [],
    },
    disableSaleTypesButtons: {
      type: Boolean,
      default: false,
    },
    hideRemoveItemRowCheckbox: {
      type: Boolean,
      default: false,
    },
    transactionLocationId: {
      type: [Number, String],
    },
    quantityIdentifier: {
      type: String,
      default: 'quantity',
    },
    disableAdditionalRequirements: {
      type: Boolean,
      default: false,
    },
    functionType: {
      type: String,
      default: 'all',
    },
    filterBySaleTypes: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      kittingIdentifier: 'kittings',
      kittingDefaultTab: 'kitComponents',
      productDefaultTab: 'redemption',
      cartSelectedProductIDs: [],
      cartSelectedKittingIDs: [],
      cartPwpSelectedIDs: [],
      kittingModalData: {
        items: [],
        kittingID: '',
        kittingCode: '',
        kittingQty: '',
        title: '',
      },
      promotionsModalData: {
        data: {},
        title: '',
      },
      standardProductModalData: {
        items: [],
        title: '',
        productID: '',
        productCode: '',
        productQty: '',
      },
      terms: '',
      attributesOptionsData: [],
      tableTh: [
        '#',
        'Voucher No',
        'Product Code',
        'Product Name',
        'Trans Type',
        'Available Quantity',
        'Quantity',
        this.$t('sales.DTableLabel.unitCv'),
        this.$t('sales.DTableLabel.totalCv'),
        'Unit Price',
        'Total Price',
      ],
    }
  },
  computed: {
    ...mapState({
      masterData: state => state.globalCMP.masterData.data.list,
      cartPwpItemsTempList: state => state.salesCMP.cartPwpItemsTempList,
      cartPwpValidationIds: state => state.salesCMP.cartPwpValidationIds,
      productsCollection: state => state.salesCMP.salesProductSearchList.list,
      cartPromotionalRowCurrentStatus: state => state.salesCMP.cartPromotionalRowCurrentStatus,
      appSettings: state => state.globalCMP.appSettings,
    }),
    ...mapGetters({
      currencyLabelByCountry: 'currencyLabelByCountry',
      paginationQuery: 'pagination',
      getAdditionalAttributesInvalidRowStatus: 'getAdditionalAttributesInvalidRowStatus',
      getMasterDataIdByKeyAndTitle: 'getMasterDataIdByKeyAndTitle',
      getSaleEligibleApiErrorMsg: 'getSaleEligibleApiErrorMsg',
    }),
    getDeliverInfo() {
      let info = this.$helpers.getValue(this.salesData, 'delivery_order', [])
      return _.chain(info)
        .groupBy('sales_product_id')
        .map(value => ({
          code: this.$helpers.getValue(value, '[0].product.product.sku', '--N/A--'),
          name: this.$helpers.getValue(value, '[0].product.product.name', '--N/A--'),
          provider: this.$helpers.getValue(value, '[0].service.title'),
          stages: _.sortBy(value, 'created_at'),
        }))
        .value()
    },
    isEsacRedemption: function() {
      return this.salesData.is_esac_redemption === 1
    },
    focID() {
      return this.getMasterDataIdByKeyAndTitle(
        this.$const.masterKey.PWP_FREE_ITEMS_PROMO_TYPES,
        this.$const.masterData.FOC
      )
    },
    pwpFID() {
      return this.getMasterDataIdByKeyAndTitle(
        this.$const.masterKey.PWP_FREE_ITEMS_PROMO_TYPES,
        this.$const.masterData.PWPF
      )
    },
    getTransactionLocationID() {
      return this.transactionLocationId === undefined
        ? this.$helpers.getValue(this.salesData, 'location_id', null)
        : this.transactionLocationId
    },
    getProducts() {
      return this.$helpers.getValue(this.salesData, 'products', [])
    },
    getKitting() {
      if (this.$helpers.isSet(this.salesData, 'kittings')) {
        return this.$helpers.getValue(this.salesData, 'kittings', [])
      } else {
        // TODO temp identifier for kitting to make sure this shared component support all variations
        // TODO fix shut be on backend
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.kittingIdentifier = 'kitting'
        return this.$helpers.getValue(this.salesData, 'kitting', [])
      }
    },
    getPromotions() {
      return this.$helpers.getValue(this.salesData, 'promotion', [])
    },
    getSelectedPromotions() {
      return this.$helpers.getValue(this.salesData, 'selected.promotions', [])
    },
    getEsacVouchers() {
      return this.$helpers.getValue(this.salesData, 'esac_vouchers_list', [])
    },
    getFreeItems() {
      return this.$helpers.getValue(this.salesData, 'free_items', [])
    },
    getSelectedAdditionalRequirements() {
      return this.$helpers.getValue(this.salesData, 'selected.additional_requirements', [])
    },
    isCartError() {
      let products = this.$helpers.getValue(this.validations, 'products')
      let kitting = this.$helpers.getValue(this.validations, 'kittings')
      if (products) {
        return products.$error
      }
      if (kitting) {
        return kitting.$error
      }
      return false
    },
  },
  mounted() {
    this.master.keys = [
      this.$const.masterKey.SALE_TYPES,
      this.$const.masterKey.PWP_FREE_ITEMS_PROMO_TYPES,
      this.$const.masterKey.PRODUCT_ADDITIONAL_REQUIREMENTS,
    ]
    if (this.lockSalesOrder) {
      if (this.getSelectedPromotions) {
        this.getSelectedPromotions.forEach(item => {
          this.setCartPwpValidationIds(item.promo_id)
        })
      }
    }
  },
  methods: {
    ...mapActions(['getSalesProductSearchAction', 'getEnrollmentSalesProductSearchAction']),
    ...mapMutations({
      setNotification: 'SHOW_NOTIFICATION',
      openCloseModal: 'OPEN_CLOSE_MODAL_FORM',
      setCartPwpValidationIds: 'SET_CART_PWP_VALIDATION_IDS',
      unsetCartPwpValidationIds: 'UNSET_CART_PWP_VALIDATION_IDS',
      setCartPwpItemTempList: 'SET_CART_PWP_ITEM_TEMP_LIST',
      unsetCartPwpItemList: 'UNSET_CART_PWP_ITEM_TEMP_LIST',
      addUpdatePromotionalRowCurrentStatus: 'ADD_UPDATE_PROMOTIONAL_ROW_CURRENT_STATUS',
      unsetPromotionalRowCurrentStatus: 'UNSET_PROMOTIONAL_ROW_CURRENT_STATUS',
      setCartAdditionalAttributesIncompleteIds: 'SET_CART_ADDITIONAL_ATTRIBUTES_INCOMPLETE_IDS',
      unsetCartAdditionalAttributesIncompleteIds: 'UNSET_CART_ADDITIONAL_ATTRIBUTES_INCOMPLETE_IDS',
      unsetAdditionalRequirementsQuantity: 'UNSET_ADDITIONAL_REQUIREMENTS_QUANTITY',
    }),
    getUnitCvByTransactionType(type, id, defaultCV = 0) {
      if (
        type === 'product' &&
        typeof this.salesData.cvs !== 'undefined' &&
        typeof this.salesData.cvs.products !== 'undefined'
      ) {
        let index = this.salesData.cvs.products.findIndex(x => x.product_id === id)
        if (index !== -1) {
          return this.salesData.cvs.products[index].unit_cv
        }
      }
      if (type === 'kitting' && this.salesData.cvs !== undefined && typeof this.salesData.cvs.kitting !== 'undefined') {
        let index = this.salesData.cvs.kitting.findIndex(x => x.kitting_id === id)
        if (index !== -1) {
          return this.salesData.cvs.kitting[index].unit_cv
        }
      }
      return defaultCV
    },
    itemsRedemptionEligibility(data, key = 'product.is_dummy_code') {
      let count = 0
      data.forEach(item => {
        if (
          this.$helpers.getValue(item, key) &&
          item.dummy !== undefined &&
          item.dummy !== null &&
          item.dummy.is_lingerie === 1
        ) {
          count += 1
        } else if (this.$helpers.getValue(item, key) && item.dummy === null) {
          count += 1
        }
      })
      return count > 0
    },
    resetAdditionalRequirementItems(productID = false, kittingID = false) {
      if (
        this.$helpers.isSet(this.salesData, 'selected.additional_requirements') &&
        Object.keys(this.getSelectedAdditionalRequirements).length > 0
      ) {
        for (let [key] of Object.entries(this.getSelectedAdditionalRequirements)) {
          if (this.getSelectedAdditionalRequirements[key]) {
            let items = []
            items = this.getSelectedAdditionalRequirements[key].filter(x => {
              if (productID && !kittingID) {
                return x.product_id === productID && x.kitting_id === null
              } else {
                return x.kitting_id === kittingID
              }
            })
            if (items.length > 0) {
              items.forEach(item => {
                let itemIndex = this.getSelectedAdditionalRequirements[key].findIndex(x => {
                  if (productID && !kittingID) {
                    return x.product_id === item.product_id && x.kitting_id === item.kitting_id
                  } else {
                    return x.kitting_id === item.kitting_id
                  }
                })
                if (itemIndex !== -1) {
                  this.unsetAdditionalRequirementsQuantity({ productID: item.product_id, kittingID: item.kitting_id })
                  this.getSelectedAdditionalRequirements[key].splice(itemIndex, 1)
                }
              })
            }
          }
        }
      }
    },
    reCalculateCart(type, id = null) {
      // Call parent method
      this.$emit('reCalculateCart', type, id)
    },
    mixActions(name, section, data, title, code, id, qty, dummy) {
      this.openCloseModal({ name: name, status: true })
      if (section === 'standard') {
        if (typeof data !== 'undefined' && Object.keys(data).length > 0) {
          this.standardProductModalData.items = []
          this.standardProductModalData.items.push(data)
          this.standardProductModalData.title = title
          this.standardProductModalData.productID = data.product_id
          this.standardProductModalData.productCode = data.sku
          this.standardProductModalData.productQty = qty
        }
      }
      if (section === 'kitting') {
        if (typeof data !== 'undefined' && data.length > 0) {
          this.kittingModalData.items = [...data]
          this.kittingModalData.title = title
          this.kittingModalData.kittingID = id
          this.kittingModalData.kittingCode = code
          this.kittingModalData.kittingQty = qty
        }
      }
      if (section === 'promotion') {
        if (typeof data !== 'undefined' && Object.keys(data).length > 0) {
          this.promotionsModalData.data = Object.assign({}, data)
          this.promotionsModalData.title = title
        }
      }
    },
    removeRowFromCart() {
      let products = this.getProducts
      let kittings = this.getKitting
      let promotions = this.getPromotions
      let pwpTemp = this.cartPwpItemsTempList
      let selectedPromotions = this.getSelectedPromotions
      if (this.cartSelectedProductIDs.length > 0) {
        this.cartSelectedProductIDs.forEach(id => {
          this.resetAdditionalRequirementItems(id, null)
          let productIndex = products.findIndex(x => x.product_id === id)
          this.unsetCartAdditionalAttributesIncompleteIds({ key: 'product_ids', id: id })
          this.unsetAdditionalRequirementsQuantity({ productID: id, kittingID: null })
          products.splice(productIndex, 1)
        })
        this.cartSelectedProductIDs = []
        this.reCalculateCart(this.functionType ? this.functionType : 'promo')
      }
      if (this.cartSelectedKittingIDs.length > 0) {
        this.cartSelectedKittingIDs.forEach(id => {
          this.resetAdditionalRequirementItems(null, id)
          this.unsetCartAdditionalAttributesIncompleteIds({ key: 'kitting_ids', id: id })
          let kittingIndex = kittings.findIndex(x => x.kitting_id === id)
          this.unsetAdditionalRequirementsQuantity({ productID: null, kittingID: id })
          kittings.splice(kittingIndex, 1)
        })
        this.cartSelectedKittingIDs = []
        this.reCalculateCart(this.functionType ? this.functionType : 'promo')
      }
      if (this.cartPwpSelectedIDs.length > 0) {
        this.cartPwpSelectedIDs.forEach(id => {
          let promoIndex = promotions.findIndex(x => x.promo_id === id)
          this.setCartPwpItemTempList(promotions[promoIndex])
          promotions.splice(promoIndex, 1)
          this.unsetPromotionalRowCurrentStatus({ promoID: id })
        })
        if (pwpTemp.length > 0) {
          pwpTemp.forEach(item => {
            let data = selectedPromotions.filter(x => x.promo_id === item.promo_id)
            if (data.length > 0) {
              data.forEach(item => {
                let selectedPromotionIndex = selectedPromotions.findIndex(x => x.promo_id === item.promo_id)
                selectedPromotions.splice(selectedPromotionIndex, 1)
                let validationIndex = this.cartPwpValidationIds.findIndex(x => x === item.promo_id)
                this.unsetCartPwpValidationIds(validationIndex)
              })
            }
          })
          this.reCalculateCart(this.functionType ? this.functionType : 'promo')
        }
        this.cartPwpSelectedIDs = []
      }
    },
    getPromoTypeNameByID(id) {
      if (typeof this.masterData.promotion_free_items_promo_types !== 'undefined') {
        let type = this.masterData.promotion_free_items_promo_types.filter(x => x.id === id)
        if (type.length > 0) {
          return type[0].title
        }
      }
      return '-'
    },
    getPromoOptionItemRowStatus(optionID, setID, productID, setKey) {
      let promo = this.getSelectedPromotions
      let exist = promo.filter(
        x => x.option_id === optionID && x.set_id === setID && x.product_id === productID && x.set_key === setKey
      )
      return exist.length > 0
    },
    getBulkSelectionButtonStatus(products, setKey) {
      if (products.length > 0) {
        let selectedPromotions = this.getSelectedPromotions
        let exist = selectedPromotions.filter(
          x => x.promo_id === products[0].promo_id && x.option_id === products[0].option_id && x.set_key === setKey
        )
        if (exist.length > 0) {
          return true
        }
      }
      return false
    },
    setBulkSelectionProducts(products, operator, setKey, pwpValue) {
      let selectedPromotions = this.getSelectedPromotions
      let count = selectedPromotions.filter(
        x => x.promo_id === products[0].promo_id && x.option_id === products[0].option_id && x.set_key === setKey
      ).length
      if (count < 1 && products.length > 0) {
        let i = 0
        products.forEach(item => {
          i++
          this.setPromoOptionsItemRow(
            item.promo_id,
            item.option_id,
            item.id,
            item.product_id,
            operator,
            setKey,
            pwpValue,
            item.quantity,
            products.length,
            i
          )
        })
      } else {
        this.removeBulkSelectionProducts(products, operator, pwpValue)
      }
    },
    removeBulkSelectionProducts(products, operator, pwpValue) {
      if (products.length > 0) {
        products.forEach(item => {
          this.removePromoOptionItemRow(item.option_id, item.id, item.promo_id, operator, pwpValue)
        })
      }
    },
    setPromoOptionsItemRow(
      promoID,
      optionID,
      setID,
      productID,
      operator,
      setkey,
      pwpValue,
      quantity,
      totalPwpCount,
      currentPwpCount
    ) {
      if (operator === '') {
        operator = 'OR'
      }
      let item = {
        promo_id: promoID,
        option_id: optionID,
        set_id: setID,
        product_id: productID,
        operator: operator,
        set_key: setkey,
        selected_quantity: quantity,
      }
      let promo = this.getSelectedPromotions
      let exist = promo.filter(
        x => x.promo_id === promoID && x.option_id === optionID && x.set_id === setID && x.product_id === productID
      )
      if (exist.length <= 0) {
        this.getSelectedPromotions.push(item)
      }
      this.promoOptionItemRowValidation(promoID, operator)
      if (pwpValue !== '' && pwpValue > 0 && typeof totalPwpCount !== 'undefined') {
        if (totalPwpCount === currentPwpCount) {
          this.reCalculateCart(this.cartPwpItemsTempList.length > 0 ? 'promo' : 'promo_price')
        }
      } else {
        this.reCalculateCart(this.cartPwpItemsTempList.length > 0 ? 'promo' : 'promo_price')
      }
    },
    removePromoOptionItemRow(optionID, setID, promoID, operator, pwpValue) {
      if (operator === '') {
        operator = 'OR'
      }
      let selectedPromotions = this.getSelectedPromotions
      let removeIndex = selectedPromotions.findIndex(x => x.option_id === optionID && x.set_id === setID)
      if (removeIndex >= 0) {
        selectedPromotions.splice(removeIndex, 1)
      }
      this.promoOptionItemRowValidation(promoID, operator, 'remove')
      if (pwpValue !== '' && pwpValue > 0) {
        this.reCalculateCart(this.cartPwpItemsTempList.length > 0 ? 'promo' : 'promo_price')
      }
    },
    limitPromotionItemRowSelectionByOperator(promoID, optionID, setID, productID, operator, setKey) {
      if (operator === '') {
        operator = 'OR'
      }
      let promo = this.getSelectedPromotions
      if (typeof promo !== 'undefined' && promo.length > 0) {
        let exist = []
        if (operator === 'OR') {
          exist = promo.filter(x => x.promo_id === promoID && x.option_id === optionID && x.set_key === setKey)
          if (exist.length > 0) {
            return false
          } else {
            // special case where this promo not inside selected array
            return promo.findIndex(x => x.promo_id === promoID) !== -1
          }
        } else if (operator === 'AND') {
          exist = promo.filter(x => x.promo_id === promoID && x.option_id === optionID)
          if (exist.length > 0) {
            let setCount = promo.filter(x => x.promo_id === promoID && x.option_id === optionID && x.set_key === setKey)
              .length
            return setCount <= 0
          } else {
            return false
          }
        }
      }
      return false
    },
    limitBulkItemRowSelectionByOperator(products, operator, setKey) {
      if (operator === '') {
        operator = 'OR'
      }
      let promo = this.getSelectedPromotions
      if (typeof promo !== 'undefined' && promo.length > 0 && products.length > 0) {
        let exist = []
        if (operator === 'OR') {
          exist = promo.filter(
            x => x.promo_id === products[0].promo_id && x.option_id === products[0].option_id && x.set_key === setKey
          )
          if (exist.length > 0) {
            return false
          } else {
            // special case where this promo not inside selected array
            return promo.findIndex(x => x.promo_id === products[0].promo_id) !== -1
          }
        } else if (operator === 'AND') {
          exist = promo.filter(x => x.promo_id === products[0].promo_id && x.option_id === products[0].option_id)
          if (exist.length > 0) {
            let setCount = promo.filter(
              x => x.promo_id === products[0].promo_id && x.option_id === products[0].option_id && x.set_key === setKey
            ).length
            return setCount <= 0
          } else {
            return false
          }
        }
      }
      return false
    },
    promoOptionItemRowValidation(promoID, operator, actionType) {
      if (operator === '') {
        operator = 'OR'
      }
      let selected = 0
      selected = this.getSelectedPromotions.filter(x => x.promo_id === promoID).length
      if (operator === 'AND') {
        if (selected > 0 && actionType !== 'remove') {
          this.setCartPwpValidationIds(promoID)
        } else {
          let iAND = this.cartPwpValidationIds.indexOf(promoID)
          if (iAND !== -1) {
            this.unsetCartPwpValidationIds(iAND)
          }
        }
      } else if (operator === 'OR') {
        if (selected > 0 && actionType !== 'remove') {
          this.setCartPwpValidationIds(promoID)
        } else {
          let iOR = this.cartPwpValidationIds.indexOf(promoID)
          if (iOR !== -1) {
            this.unsetCartPwpValidationIds(iOR)
          }
        }
      }
    },
    promoOptionItemRowValidationCount(promoID, conditions) {
      let operator = conditions.operator
      let options = conditions.options
      let promotions = this.getSelectedPromotions
      let productsCount = 0
      if (operator === 'OR' || operator === '') {
        if (options.length > 0) {
          options.forEach(item => {
            let optionCount = Object.keys(item)
              .pop()
              .split('_')
            for (let iOR = 1; iOR <= parseInt(optionCount[1]); iOR++) {
              let optionName = 'option_' + iOR
              if (typeof item[optionName] !== 'undefined') {
                let setCount = Object.keys(item[optionName])
                  .pop()
                  .split('_')
                for (let jOR = 1; jOR <= parseInt(setCount[1]); jOR++) {
                  let setName = 'set_' + jOR
                  if (
                    !this.limitPromotionItemRowSelectionByOperator(
                      promoID,
                      item[optionName].option_id,
                      '',
                      '',
                      operator,
                      setName
                    )
                  ) {
                    productsCount += item[optionName][setName].length
                  }
                }
              }
            }
          })
          let promotionCount = promotions.filter(x => x.promo_id === promoID).length
          return {
            promoCount: promotionCount,
            productCount: productsCount,
          }
        }
      } else if (operator === 'AND') {
        if (options.length > 0) {
          options.forEach(item => {
            let optionCount = Object.keys(item)
              .pop()
              .split('_')
            for (let iAND = 1; iAND <= parseInt(optionCount[1]); iAND++) {
              let optionName = 'option_' + iAND
              if (typeof item[optionName] !== 'undefined') {
                let setCount = Object.keys(item[optionName])
                  .pop()
                  .split('_')
                for (let jAND = 1; jAND <= parseInt(setCount[1]); jAND++) {
                  let setName = 'set_' + jAND
                  if (
                    !this.limitPromotionItemRowSelectionByOperator(
                      promoID,
                      item[optionName].option_id,
                      '',
                      '',
                      operator,
                      setName
                    )
                  ) {
                    productsCount += item[optionName][setName].length
                  }
                }
              }
            }
          })
          let promotionCount = promotions.filter(x => x.promo_id === promoID).length
          return {
            promoCount: promotionCount,
            productCount: productsCount,
          }
        }
      }
    },
    getPromoItemRowPwpItemQty(promoID, promoTypeID) {
      let promo = this.getSelectedPromotions
      if (promo.length > 0) {
        let items = promo.filter(x => x.promo_id === promoID)
        let count = 0
        items.forEach(item => {
          if (promoTypeID !== undefined && this.getPwpPromoType(promoTypeID, this.$const.masterData.PWPF)) {
            count = 1
          } else {
            count += item.selected_quantity ? item.selected_quantity : 0
          }
        })
        return count
      }
      return 0
    },
    revertBackPwpTempItemToCartByIndex(index) {
      let pwpTemp = this.cartPwpItemsTempList
      let promotions = this.getPromotions
      promotions.push(pwpTemp[index])
      this.unsetCartPwpItemList(index)
    },
    setPwpSelectedQuantity(promoID, optionID, setID, productID, quantity) {
      let promo = this.getSelectedPromotions
      let itemIndex = promo.findIndex(
        x => x.promo_id === promoID && x.option_id === optionID && x.set_id === setID && x.product_id === productID
      )
      if (itemIndex !== -1) {
        this.getSelectedPromotions[itemIndex].selected_quantity = quantity
        this.reCalculateCart(this.cartPwpItemsTempList.length > 0 ? this.functionType : 'promo_price')
      }
    },
    getPwpSelectedQuantity(promoID, optionID, setID, productID) {
      let promo = this.getSelectedPromotions
      let itemIndex = promo.findIndex(
        x => x.promo_id === promoID && x.option_id === optionID && x.set_id === setID && x.product_id === productID
      )
      if (itemIndex !== -1) {
        return this.getSelectedPromotions[itemIndex].quantity
      }
      return '--??--'
    },
    getPwpPromoType(promoTypeID, checkingTitle) {
      let promoType = this.masterData.promotion_free_items_promo_types
      if (promoType.length > 0) {
        let row = promoType.find(x => x.id === promoTypeID)
        if (Object.keys(row).length > 0) {
          if (row.title === checkingTitle) {
            return true
          }
        }
      }
      return false
    },
    setPromotionalRowCurrentStatus(object) {
      let itemIndex = this.cartPromotionalRowCurrentStatus.findIndex(x => x.promoID === object.promoID)
      this.addUpdatePromotionalRowCurrentStatus({ data: object, index: itemIndex })
    },
    async changeItemsSaleTypeByBulk(key) {
      let count = 0
      if (this.getProducts.length > 0 || this.getKitting.length > 0) {
        let saleTypeID = this.getMasterDataIdByKeyAndTitle('sale_types', key)
        if (this.getProducts.length > 0) {
          this.getProducts.forEach(product => {
            if (
              product.general !== undefined &&
              product.general.sale_types !== undefined &&
              product.general.sale_types.length > 0
            ) {
              if (product.general.sale_types.includes(saleTypeID)) {
                product.transaction_type = saleTypeID
              } else {
                count += 1
              }
            }
          })
        }
        if (this.getKitting.length > 0) {
          this.getKitting.forEach(kitting => {
            if (
              kitting.general !== undefined &&
              kitting.general.sale_types !== undefined &&
              kitting.general.sale_types.length > 0
            ) {
              if (kitting.general.sale_types.includes(saleTypeID)) {
                kitting.transaction_type = saleTypeID
              } else {
                count += 1
              }
            }
          })
        }
        if (count > 0) {
          Dialog.create({
            title: 'Attention !',
            noBackdropDismiss: true,
            noEscDismiss: true,
            message: `[Bulk update] - Selected transaction type "${key}" unavailable for some items`,
          })
        }
        await this.reCalculateCart(this.functionType)
      }
    },
    search() {
      if (this.terms !== '') {
        if (!this.isEnrollmentSearch) {
          let query = {
            country_id: this.memberDetails.details.country_id,
            user_id: this.memberDetails.details.user_id,
            text: this.terms !== '' ? this.terms : null,
            limit: 1,
            mixed: true,
            transaction_location_id: this.salesData.location_id,
            stock_location_id: this.salesData.stock_location_id,
            exclude: this.excludeKittingSearch ? 'kitting' : '',
            is_consignment_return: this.isConsignmentReturn,
            filters: this.filters,
            exclude_filters: this.excludeFilters,
            offset: 0,
          }
          if (this.isRentalSales) {
            let id = this.getMasterDataIdByKeyAndTitle('sale_types', this.$const.masterData.RENTAL)
            if (id !== '') {
              query.sale_types = [id]
            }
          }
          this.getSalesProductSearchAction(query).then(() => {
            this.processBarcodeSearchResult()
          })
        } else {
          let query = {
            country_id: this.enrollmentCountryID,
            transaction_location_id: this.salesData.location_id,
            enrollment_type_id: this.enrollmentTypeID,
            is_rental_sales: this.isRentalSales,
            text: this.terms !== '' ? this.terms : null,
            filters: this.filters,
            exclude_filters: this.excludeFilters,
            limit: 1,
            offset: 0,
          }
          this.getEnrollmentSalesProductSearchAction(query).then(() => {
            this.processBarcodeSearchResult()
          })
        }
      }
    },
    processBarcodeSearchResult() {
      this.terms = ''
      if (this.productsCollection.data !== undefined && this.productsCollection.data.length > 0) {
        if (this.productsCollection.data[0].is_kitting === 0) {
          this.addToCart('product', this.productsCollection.data[0].id)
        } else {
          this.addToCart('kitting', this.productsCollection.data[0].id)
        }
      } else {
        this.setNotification({
          title: 'Product Search Error',
          message: 'Product Not Found',
          type: 'negative',
        })
      }
    },
    quantityOptionsGenerator(item, quantity) {
      let options = []
      if (quantity !== '' && quantity !== null) {
        for (let i = 0; i <= quantity; i++) {
          let row = {
            label: i.toString(),
            value: i,
          }
          options.push(row)
        }
      }
      return options
    },
    getOptionalCompressionSaleTypeOptions(item) {
      return this.$helpers.getValue(item, 'general.sale_types', [])
    },
  },
}
</script>
